/**
 * inject-invitations.ts
 * Lee archivos .csv de la raíz del proyecto, crea clientes si no existen
 * e inserta invitaciones digitales en la BD.
 *
 * Uso:
 *   cd server
 *   npx ts-node scripts/inject-invitations.ts             # insertar
 *   npx ts-node scripts/inject-invitations.ts --dry-run   # solo previsualizar
 *
 * Columnas CSV requeridas:
 *   names, title, eventType, eventDate, clientEmail
 *
 * Columna para auto-crear cliente (si no existe):
 *   clientName  — nombre completo del cliente (obligatorio si el cliente no existe)
 *   clientPhone — teléfono (opcional)
 *   clientPassword — contraseña inicial (opcional, default: Cliente123!)
 *
 * Columnas opcionales de invitación:
 *   eventTime, venue, locationNote, message, quote, hashtag, template, dressCode,
 *   rsvpLabel, rsvpValue, rsvpDeadline, isPublished, guestGreeting, defaultGuestName,
 *   heroImage, ceremonyVenue, ceremonyAddress, ceremonyTime, ceremonyMapUrl,
 *   receptionVenue, receptionAddress, receptionTime, receptionMapUrl,
 *   parentsInfo, sponsorsInfo, giftsInfo, instagramHandle, invitationType
 *
 * parentsInfo / sponsorsInfo: separados por ";" (ej. "Carlos & María;Ana & Luis")
 * isPublished: "true" | "false" (default: true)
 * invitationType: "general" | "individual" (default: "general")
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()
const ROOT_DIR = path.resolve(__dirname, '..', '..')
const DRY_RUN = process.argv.includes('--dry-run')
const DEFAULT_PASSWORD = 'Cliente123!'

// ─── CSV parser ───────────────────────────────────────────────────────────────

function parseCsvRow(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim()); current = ''
    } else {
      current += ch
    }
  }
  fields.push(current.trim())
  return fields
}

function parseCsv(content: string): Record<string, string>[] {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = parseCsvRow(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, ''))
  return lines.slice(1).map(line => {
    const values = parseCsvRow(line)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = values[i] ?? '' })
    return row
  })
}

// ─── Value helpers ────────────────────────────────────────────────────────────

const col = (row: Record<string, string>, ...keys: string[]): string => {
  for (const k of keys) { const v = row[k]; if (v !== undefined && v !== '') return v }
  return ''
}

const toNull = (v: string): string | null => v.trim() ? v.trim() : null

const toBool = (v: string, def = true): boolean =>
  v === 'false' || v === '0' || v === 'no' ? false
  : v === 'true' || v === '1' || v === 'si' || v === 'sí' ? true
  : def

const toSemicolonArray = (v: string): string | null => {
  if (!v.trim()) return null
  return JSON.stringify(v.split(';').map(s => s.trim()).filter(Boolean))
}

// ─── Obtener o crear cliente ──────────────────────────────────────────────────

// Cache para no hacer múltiples lookups del mismo email en el mismo run
const clientCache = new Map<string, string>()

async function resolveClientId(
  email: string,
  name: string | null,
  phone: string | null,
  password: string | null,
  dryRun: boolean
): Promise<{ id: string; created: boolean } | null> {
  if (clientCache.has(email)) {
    return { id: clientCache.get(email)!, created: false }
  }

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true } })

  if (existing) {
    clientCache.set(email, existing.id)
    return { id: existing.id, created: false }
  }

  // Cliente no existe — crear
  if (!name) {
    console.error(`        ✗ Cliente "${email}" no existe y no se proporcionó clientName → omitiendo`)
    return null
  }

  if (dryRun) {
    console.log(`        + [DRY RUN] Se crearía cliente: ${name} <${email}>`)
    // Usar ID ficticio para dry-run
    const fakeId = `dry-run-${email}`
    clientCache.set(email, fakeId)
    return { id: fakeId, created: true }
  }

  const hashed = await bcrypt.hash(password || DEFAULT_PASSWORD, 10)
  const newClient = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      password: hashed,
      role: 'CLIENT',
      isActive: true,
    },
    select: { id: true },
  })

  clientCache.set(email, newClient.id)
  return { id: newClient.id, created: true }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (DRY_RUN) console.log('🔍 MODO DRY-RUN — no se guardará nada en la BD\n')

  const csvFiles = fs.readdirSync(ROOT_DIR).filter(f => f.toLowerCase().endsWith('.csv'))

  if (csvFiles.length === 0) {
    console.log(`No se encontraron archivos .csv en: ${ROOT_DIR}`)
    console.log('Crea un archivo .csv con las columnas requeridas y vuelve a ejecutar.')
    return
  }

  let totalCreated = 0
  let totalSkipped = 0
  let totalErrors = 0
  let totalClientsCreated = 0

  for (const file of csvFiles) {
    const filePath = path.join(ROOT_DIR, file)
    console.log(`\n📄 Archivo: ${file}`)

    const content = fs.readFileSync(filePath, 'utf-8')
    const rows = parseCsv(content)

    if (rows.length === 0) {
      console.log('   Sin filas de datos. Omitiendo.')
      continue
    }

    console.log(`   ${rows.length} fila(s) encontrada(s)`)
    let fileCreated = 0; let fileSkipped = 0; let fileErrors = 0

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2

      // Campos requeridos de la invitación
      const names     = toNull(col(row, 'names', 'nombres'))
      const title     = toNull(col(row, 'title', 'titulo'))
      const eventType = toNull(col(row, 'eventtype', 'event_type', 'tipo_evento', 'tipodeevento'))
      const eventDate = toNull(col(row, 'eventdate', 'event_date', 'fecha', 'fechaevento'))

      if (!names || !title || !eventType || !eventDate) {
        console.warn(`   ⚠  Fila ${rowNum}: campos requeridos faltantes (names, title, eventType, eventDate) → omitiendo`)
        fileSkipped++; continue
      }

      // Resolver cliente (buscar o crear)
      const clientEmail = toNull(col(row, 'clientemail', 'client_email', 'email', 'correo'))
      const directClientId = toNull(col(row, 'clientid', 'client_id'))

      let clientId: string

      if (directClientId) {
        clientId = directClientId
      } else if (clientEmail) {
        const clientName  = toNull(col(row, 'clientname', 'client_name', 'nombre_cliente', 'nombrecliente'))
        const clientPhone = toNull(col(row, 'clientphone', 'client_phone', 'telefono_cliente', 'telefono'))
        const clientPass  = toNull(col(row, 'clientpassword', 'client_password', 'password_cliente'))

        const preview = `"${names}" · ${eventType} · ${eventDate}`
        console.log(`   → Fila ${rowNum}: ${preview}`)

        const result = await resolveClientId(clientEmail, clientName, clientPhone, clientPass, DRY_RUN)
        if (!result) { fileSkipped++; continue }
        if (result.created) {
          totalClientsCreated++
          if (!DRY_RUN) console.log(`        + Cliente creado: ${clientName} <${clientEmail}> (pass: ${clientPass || DEFAULT_PASSWORD})`)
        } else {
          console.log(`        · Cliente existente: ${clientEmail}`)
        }
        clientId = result.id
      } else {
        console.error(`   ✗  Fila ${rowNum}: se requiere clientEmail o clientId → omitiendo`)
        fileSkipped++; continue
      }

      // rsvpDeadline
      const rsvpDeadlineRaw = col(row, 'rsvpdeadline', 'rsvp_deadline', 'fechalimite')
      let rsvpDeadline: Date | null = null
      if (rsvpDeadlineRaw.trim()) {
        const d = new Date(rsvpDeadlineRaw.trim())
        if (!isNaN(d.getTime())) rsvpDeadline = d
        else console.warn(`        ⚠ rsvpDeadline "${rsvpDeadlineRaw}" inválido → se ignora`)
      }

      // invitationType
      const rawInvType = col(row, 'invitationtype', 'invitation_type', 'tipoinv', 'tipo_inv').toLowerCase()
      const invitationType = rawInvType === 'individual' ? 'individual' : 'general'

      // template
      const VALID_TEMPLATES = ['warm','floral','rustic','moderno','vintage','pearl','esmeralda','noir','lavanda','terracota']
      const rawTemplate = col(row, 'template', 'plantilla').toLowerCase().trim()
      const templateBase = rawTemplate.replace(/-emboss$|-foil$/, '')
      const template = VALID_TEMPLATES.includes(templateBase) ? rawTemplate : 'floral'

      const data = {
        clientId,
        invitationType,
        names,
        title,
        eventType,
        eventDate,
        eventTime:        toNull(col(row, 'eventtime', 'event_time', 'hora')),
        venue:            toNull(col(row, 'venue', 'lugar', 'salon')),
        locationNote:     toNull(col(row, 'locationnote', 'location_note', 'ciudad')),
        message:          toNull(col(row, 'message', 'mensaje')),
        quote:            toNull(col(row, 'quote', 'cita', 'frase')),
        hashtag:          toNull(col(row, 'hashtag')),
        template,
        dressCode:        toNull(col(row, 'dresscode', 'dress_code', 'vestimenta')),
        rsvpLabel:        toNull(col(row, 'rsvplabel', 'rsvp_label')) ?? 'Confirmar asistencia',
        rsvpValue:        toNull(col(row, 'rsvpvalue', 'rsvp_value', 'rsvp', 'whatsapp', 'contacto')),
        rsvpDeadline,
        isPublished:      toBool(col(row, 'ispublished', 'is_published', 'publicado'), true),
        guestGreeting:    toNull(col(row, 'guestgreeting', 'guest_greeting', 'saludo')) ?? 'Hola',
        defaultGuestName: toNull(col(row, 'defaultguestname', 'default_guest_name')) ?? 'Familia y Amigos',
        heroImage:        toNull(col(row, 'heroimage', 'hero_image', 'fotoprincipal', 'foto_principal')),
        ceremonyVenue:    toNull(col(row, 'ceremonyvenue', 'ceremony_venue', 'lugar_ceremonia')),
        ceremonyAddress:  toNull(col(row, 'ceremonyaddress', 'ceremony_address', 'direccion_ceremonia')),
        ceremonyTime:     toNull(col(row, 'ceremonytime', 'ceremony_time', 'hora_ceremonia')),
        ceremonyPhoto:    toNull(col(row, 'ceremonyphoto', 'ceremony_photo', 'foto_ceremonia')),
        ceremonyMapUrl:   toNull(col(row, 'ceremonymapurl', 'ceremony_mapurl', 'mapa_ceremonia')),
        receptionVenue:   toNull(col(row, 'receptionvenue', 'reception_venue', 'lugar_recepcion')),
        receptionAddress: toNull(col(row, 'receptionaddress', 'reception_address', 'direccion_recepcion')),
        receptionTime:    toNull(col(row, 'receptiontime', 'reception_time', 'hora_recepcion')),
        receptionPhoto:   toNull(col(row, 'receptionphoto', 'reception_photo', 'foto_recepcion')),
        receptionMapUrl:  toNull(col(row, 'receptionmapurl', 'reception_mapurl', 'mapa_recepcion')),
        parentsInfo:      toSemicolonArray(col(row, 'parentsinfo', 'parents_info', 'padres')),
        sponsorsInfo:     toSemicolonArray(col(row, 'sponsorsinfo', 'sponsors_info', 'padrinos')),
        giftsInfo:        toNull(col(row, 'giftsinfo', 'gifts_info', 'regalos', 'mesa_regalos')),
        instagramHandle:  toNull(col(row, 'instagramhandle', 'instagram_handle', 'instagram')),
      }

      if (DRY_RUN) {
        console.log(`        [DRY RUN] Se crearía invitación — template: ${data.template} | isPublished: ${data.isPublished}`)
        console.log(`        ceremony: ${data.ceremonyVenue ?? '—'} | reception: ${data.receptionVenue ?? '—'}`)
        fileCreated++
      } else {
        try {
          const inv = await prisma.digitalInvitation.create({ data })
          console.log(`        ✓ Invitación creada: /invitacion/${inv.shareToken}`)
          fileCreated++
        } catch (err) {
          console.error(`        ✗ Error: ${err instanceof Error ? err.message : String(err)}`)
          fileErrors++
        }
      }
    }

    console.log(`   Resultado: ${fileCreated} creadas, ${fileSkipped} omitidas, ${fileErrors} errores`)
    totalCreated += fileCreated; totalSkipped += fileSkipped; totalErrors += fileErrors
  }

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`✅ TOTAL: ${totalCreated} invitaciones, ${totalClientsCreated} clientes nuevos, ${totalSkipped} omitidas, ${totalErrors} errores`)
  if (DRY_RUN) console.log('   (dry-run: sin cambios reales en la BD)')
}

main()
  .catch(e => { console.error('Error fatal:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
