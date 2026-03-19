/**
 * inject-grethel-xv.ts
 *
 * Script dedicado para los XV Años de Grethel.
 * Los datos de invitados están embebidos — no requiere CSV en el servidor.
 *
 * ARQUITECTURA:
 *   1 DigitalInvitation (evento maestro)  ← 1 fila en el panel admin
 *   N InvitationGuest   (uno por invitado) ← URL personalizada /g/:token
 *
 * USO:
 *   cd server && npm run inject:grethel        (escritura real)
 *   cd server && npm run inject:grethel:dry    (sin cambios en BD)
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const DRY_RUN = process.argv.includes('--dry-run')

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DEL EVENTO
// ═══════════════════════════════════════════════════════════════════════════
const CONFIG = {
  clientName:     'Grethel Huerta',
  clientEmail:    'grethel.huerta@gmail.com',
  clientPhone:    '527681000000',
  clientPassword: 'Grethel2026!',

  title:          'XV Años de Grethel',
  names:          'Grethel',
  eventType:      'XV Años',
  eventDate:      '2026-05-02',
  eventTime:      '18:00 hrs',
  template:       'floral',
  quote:          '"Hoy comienzan los mejores años de mi vida"',
  dressCode:      'Formal',
  hashtag:        '#XVGrethel',

  parentsInfo:    'Ramón Rojas González;Grissel Huerta Méndez',
  sponsorsInfo:   'Rogelio Huerta Méndez;Erika Michel Zepeda Vicencio',

  rsvpLabel:      'Confirmar asistencia',
  rsvpValue:      '527681000000',
  rsvpDeadline:   '2026-04-14',

  ceremonyVenue:    'Hotel Royal Garden',
  ceremonyAddress:  'Hotel Royal Garden',
  ceremonyTime:     '18:00 hrs',
  ceremonyMapUrl:   '',

  receptionVenue:   'Hotel Royal Garden',
  receptionAddress: 'Hotel Royal Garden',
  receptionTime:    '19:00 hrs',
  receptionMapUrl:  '',

  giftsInfo:        'Lluvia de sobres',
  guestGreeting:    'Con mucho cariño te invitamos',

  // Tipografía: familia-tamaño
  // Familias: cormorant | playfair | lora | greatvibes | dm | montserrat | raleway | josefin
  // Tamaños:  sm | md | lg
  fontStyle:        'greatvibes-xl',
} as const

// ═══════════════════════════════════════════════════════════════════════════
// LISTA DE INVITADOS (embebida — sin CSV)
// nombre, pases
// ═══════════════════════════════════════════════════════════════════════════
const GUESTS: Array<{ name: string; passes: number }> = [
  // ── Familia / General ─────────────────────────────────────────────────
  { name: 'DENNISE HERRERA Y FAMILIA',              passes: 3  },
  { name: 'MARISOL GARCIA Y FAMILIA',               passes: 5  },
  { name: 'ERIKA VICENCIO Y FAMILIA',               passes: 4  },
  { name: 'BIANCA LANDA Y FAMILIA',                 passes: 4  },
  { name: 'MANUEL HUERTA LOPEZ Y FAMILIA',          passes: 2  },
  { name: 'ALMA HUERTA LOPEZ Y FAMILIA',            passes: 4  },
  { name: 'RAUL HUERTA LOPEZ Y FAMILIA',            passes: 4  },
  { name: 'DAVID HUERTA LOPEZ Y FAMILIA',           passes: 2  },
  { name: 'DANIEL HUERTA LOPEZ Y FAMILIA',          passes: 2  },
  { name: 'OMAR HUERTA MENDEZ',                     passes: 3  },
  { name: 'FANY HUERTA MENDEZ',                     passes: 3  },
  { name: 'ALEIYI HUERTA MENDEZ',                   passes: 1  },
  { name: 'MANUEL HUERTA MENDEZ',                   passes: 2  },
  { name: 'DANIEL HUERTA ESPINOZA Y FAMILIA',       passes: 4  },
  { name: 'PERSIS HUERTA ESPINOZA',                 passes: 1  },
  { name: 'ARIEL HERNANDEZ ESPINOZA',               passes: 2  },
  { name: 'JONATHAN HERNANDEZ',                     passes: 1  },
  { name: 'OSIRIS HERNANDEZ',                       passes: 1  },
  { name: 'DAVID HUERTA RAMOS',                     passes: 1  },
  { name: 'CRISTINA HUERTA RAMOS',                  passes: 5  },
  { name: 'CELESTINO CUERVO Y FAMILIA',             passes: 2  },
  { name: 'IVAN DEL RIO',                           passes: 2  },
  { name: 'NAYELI FLORES Y FAMILIA',                passes: 4  },
  { name: 'DAFNE SOBREVILLA',                       passes: 2  },
  { name: 'SARAI PEREZ CISNEROS',                   passes: 2  },
  { name: 'CRISTINA HUERTA GOMEZ',                  passes: 5  },
  { name: 'ESPERANZA HUERTA GOMEZ',                 passes: 2  },
  { name: 'MICHEL ZEPEDA',                          passes: 10 },
  { name: 'JORGE ROJAS',                            passes: 5  },
  { name: 'PEPE ROJAS',                             passes: 2  },
  { name: 'BEATRIZ ROJAS LARIOS Y FAMILIA',         passes: 7  },
  { name: 'MARCOS ROJAS Y FAMILIA',                 passes: 2  },
  { name: 'ANA REYES',                              passes: 2  },
  { name: 'JOEL SIERRA Y FAMILIA',                  passes: 5  },
  { name: 'JORGE SIERRA Y FAMILIA',                 passes: 3  },
  { name: 'JAIME ROJAS Y FAMILIA',                  passes: 4  },
  { name: 'VERONICA ROJAS Y FAMILIA',               passes: 4  },
  { name: 'CELINA Y FAMILIA',                       passes: 5  },
  { name: 'ITZEL Y FAMILIA',                        passes: 3  },
  { name: 'ITZEL MENDEZ',                           passes: 1  },
  { name: 'CELINA Y FAMILIA (2)',                   passes: 2  },
  { name: 'FAMILIA',                                passes: 4  },
  { name: 'KASTENI',                                passes: 1  },
  { name: 'ANGEL',                                  passes: 2  },
  { name: 'HUGO RODRIGUEZ Y FAMILIA',               passes: 6  },
  { name: 'HUGO RODRIGUEZ TREJO Y FAMILIA',         passes: 3  },
  { name: 'ALBERTO RODRIGUEZ CAMACHO Y FAMILIA',    passes: 6  },
  { name: 'MARCE',                                  passes: 2  },
  { name: 'MARICONCHIS',                            passes: 2  },
  { name: 'NORA',                                   passes: 2  },
  { name: 'PEDRO MALERVA',                          passes: 2  },
  { name: 'LIZ',                                    passes: 3  },
  { name: 'YELVI',                                  passes: 2  },
  { name: 'ROCIO VALDEZ',                           passes: 3  },
  { name: 'FLOR HERNANDEZ',                         passes: 3  },
  { name: 'ROCIO LARA',                             passes: 2  },
  { name: 'EDUARDO SOLIS',                          passes: 2  },
  { name: 'HERBERT REYES',                          passes: 2  },
  { name: 'ANY PATIÑO Y FAMILIA',                   passes: 3  },
  { name: 'FELIPA ROJAS',                           passes: 2  },
  { name: 'MIGUEL VIDAL Y FAMILIA',                 passes: 3  },
  { name: 'JOSE ROJAS Y FAMILIA',                   passes: 4  },
  { name: 'ROXANA MENDEZ',                          passes: 2  },
  { name: 'MAMA AXEL',                              passes: 2  },
  { name: 'PSICOLOGO NARCISO',                      passes: 1  },
  { name: 'MAESTRA ROSA',                           passes: 2  },
  { name: 'MAESTRA FLORA',                          passes: 1  },
  { name: 'MAESTRA TAMARA',                         passes: 1  },
  { name: 'MAESTRO FRANCISCO',                      passes: 1  },
  { name: 'MAESTRA MICHEL',                         passes: 1  },
  { name: 'MAESTRA TERESITA',                       passes: 1  },
  { name: 'MAESTRA ADRY',                           passes: 4  },
  { name: 'MAESTRO MARIO',                          passes: 1  },
  { name: 'MAESTRA SILVIA',                         passes: 2  },
  { name: 'MAESTRA BETTY',                          passes: 1  },
  { name: 'ALVIS MAYA',                             passes: 2  },
  { name: 'YILIANA Y FAMILIA',                      passes: 4  },
  { name: 'PADRE JUAN',                             passes: 2  },
  { name: 'VIKY EURO',                              passes: 1  },
  { name: 'ISA EURO',                               passes: 1  },
  { name: 'REBECA SOTO TORRES',                     passes: 2  },
  { name: 'IVETTE',                                 passes: 2  },
  { name: 'BRUNO',                                  passes: 2  },
  { name: 'CARLOS PINEDA PULIDO',                   passes: 2  },
  { name: 'ESDEYNE ALEJANDRE HUERTA',               passes: 1  },
  { name: 'GUSTAVO ALEJANDRE HUERTA',               passes: 2  },
  // ── Amigos Grettel ────────────────────────────────────────────────────
  { name: 'VALERIA',                                passes: 1  },
  { name: 'ALONDRA',                                passes: 1  },
  { name: 'DANIA',                                  passes: 1  },
  { name: 'BLANCA',                                 passes: 1  },
  { name: 'RENATA',                                 passes: 1  },
  { name: 'DAFNE',                                  passes: 1  },
  { name: 'LOHANY',                                 passes: 1  },
  { name: 'ZAIRA',                                  passes: 1  },
  { name: 'FRIDA',                                  passes: 1  },
  { name: 'FATIMA',                                 passes: 1  },
  { name: 'ROBERTO',                                passes: 1  },
  { name: 'AKBAL',                                  passes: 1  },
  { name: 'MATEO TAPIA',                            passes: 1  },
  { name: 'DEAN',                                   passes: 1  },
  { name: 'JOSE MIGUEL',                            passes: 1  },
  { name: 'BRUNO (AMIGO)',                          passes: 1  },
  { name: 'CALIXTO',                                passes: 1  },
  { name: 'SEBASTIAN',                              passes: 1  },
  { name: 'KAYLEIGH',                               passes: 1  },
  { name: 'TANIA',                                  passes: 1  },
  { name: 'IVAN DEL RIO (AMIGO)',                   passes: 1  },
  { name: 'ARTURO',                                 passes: 1  },
  { name: 'DERECK',                                 passes: 1  },
  { name: 'AARON',                                  passes: 1  },
  { name: 'MILAN',                                  passes: 1  },
  { name: 'ADAL',                                   passes: 1  },
  { name: 'EMILIANO P',                             passes: 1  },
  { name: 'DAVID',                                  passes: 1  },
  { name: 'KARLA',                                  passes: 1  },
  { name: 'DANNA',                                  passes: 1  },
  { name: 'SOFIA SOTO',                             passes: 1  },
  { name: 'ANA BETANCOURT',                         passes: 1  },
  { name: 'MAITE',                                  passes: 1  },
  { name: 'CLEMENTINA',                             passes: 1  },
  { name: 'HANIA',                                  passes: 1  },
  { name: 'JIMENA',                                 passes: 1  },
  { name: 'ALEXA RAMOS',                            passes: 1  },
  { name: 'CRISTELL',                               passes: 1  },
  { name: 'MAJO',                                   passes: 1  },
  { name: 'MELO',                                   passes: 1  },
  { name: 'SOFIA SALAS',                            passes: 1  },
  { name: 'KENNYA',                                 passes: 1  },
  { name: 'ITALIA',                                 passes: 1  },
  { name: 'MARIANO',                                passes: 1  },
  { name: 'MANANNE',                                passes: 1  },
  { name: 'VALENTINA',                              passes: 1  },
  { name: 'ZAKY',                                   passes: 1  },
  { name: 'TABATA',                                 passes: 1  },
  { name: 'REGINA',                                 passes: 1  },
  { name: 'MONICA',                                 passes: 1  },
  { name: 'JULIETTA',                               passes: 1  },
  { name: 'IVANNA',                                 passes: 1  },
  { name: 'JOSUE',                                  passes: 1  },
  { name: 'BASTIAN',                                passes: 1  },
  { name: 'CAMILA',                                 passes: 1  },
  { name: 'KAMILE',                                 passes: 1  },
  { name: 'OMAR',                                   passes: 1  },
  { name: 'ROGELIO',                                passes: 1  },
  { name: 'VALERIA (AMIGA)',                        passes: 1  },
  { name: 'LLUVIA',                                 passes: 1  },
  { name: 'ANA SOFIA',                              passes: 1  },
  { name: 'KAREN',                                  passes: 1  },
  { name: 'AXEL',                                   passes: 1  },
  { name: 'MATEO VAZQUEZ',                          passes: 1  },
  { name: 'MAX',                                    passes: 1  },
  { name: 'DOMINICA',                               passes: 1  },
  { name: 'MAURICIO',                               passes: 1  },
]

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════

function toArr(value: string): string | null {
  if (!value.trim()) return null
  return JSON.stringify(value.split(';').map(s => s.trim()).filter(Boolean))
}

function toDate(value: string): Date | null {
  if (!value.trim()) return null
  const d = new Date(value + 'T12:00:00.000Z')
  return isNaN(d.getTime()) ? null : d
}

function buildPersonalizedMessage(name: string, passes: number): string {
  const firstName = name.split(' ')[0]
  if (passes === 1) {
    return `Esta invitación es personal para ti, ${firstName}. ¡Te esperamos con mucho cariño! 🎀`
  }
  return `Esta invitación es válida para ${passes} personas. ¡Los esperamos a todos, ${firstName}! 🎀`
}

// ═══════════════════════════════════════════════════════════════════════════
// PASO 1 — Resolver cuenta de cliente
// ═══════════════════════════════════════════════════════════════════════════

async function resolveClient(dryRun: boolean): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { email: CONFIG.clientEmail },
    select: { id: true, name: true },
  })

  if (existing) {
    console.log(`✓ Cliente existente: ${existing.name} <${CONFIG.clientEmail}>`)
    return existing.id
  }

  if (dryRun) {
    console.log(`  [DRY RUN] Se crearía cliente: ${CONFIG.clientName} <${CONFIG.clientEmail}>`)
    return 'dry-run-client-id'
  }

  const hashed = await bcrypt.hash(CONFIG.clientPassword, 10)
  const user = await prisma.user.create({
    data: {
      name:     CONFIG.clientName,
      email:    CONFIG.clientEmail,
      phone:    CONFIG.clientPhone || null,
      password: hashed,
      role:     'CLIENT',
      isActive: true,
    },
    select: { id: true },
  })
  console.log(`✓ Cliente creado: ${CONFIG.clientName} (pass: ${CONFIG.clientPassword})`)
  return user.id
}

// ═══════════════════════════════════════════════════════════════════════════
// PASO 2 — Limpiar registros previos de este evento
// ═══════════════════════════════════════════════════════════════════════════

async function cleanPrevious(clientId: string, dryRun: boolean) {
  const existing = await prisma.digitalInvitation.findMany({
    where: { clientId, title: CONFIG.title },
    select: { id: true, _count: { select: { guests: true } } },
  })

  if (existing.length === 0) {
    console.log('  Sin registros previos.')
    return
  }

  const totalGuests = existing.reduce((s, i) => s + i._count.guests, 0)

  if (dryRun) {
    console.log(`  [DRY RUN] Se eliminarían ${existing.length} invitación(es) y ${totalGuests} guest(s)`)
    return
  }

  const ids = existing.map(i => i.id)
  await prisma.invitationGuest.deleteMany({ where: { invitationId: { in: ids } } })
  await prisma.digitalInvitation.deleteMany({ where: { id: { in: ids } } })
  console.log(`  ✓ ${existing.length} invitación(es) y ${totalGuests} guest(s) eliminados.`)
}

// ═══════════════════════════════════════════════════════════════════════════
// PASO 3 — Crear la DigitalInvitation maestra
// ═══════════════════════════════════════════════════════════════════════════

async function createMasterInvitation(clientId: string, dryRun: boolean): Promise<string> {
  if (dryRun) {
    console.log(`  [DRY RUN] Se crearía invitación maestra: "${CONFIG.title}"`)
    return 'dry-run-invitation-id'
  }

  const inv = await prisma.digitalInvitation.create({
    data: {
      clientId,
      invitationType:  'individual',
      names:            CONFIG.names,
      title:            CONFIG.title,
      eventType:        CONFIG.eventType,
      eventDate:        CONFIG.eventDate,
      eventTime:        CONFIG.eventTime      || null,
      template:         CONFIG.template,
      fontStyle:        CONFIG.fontStyle,
      quote:            CONFIG.quote          || null,
      dressCode:        CONFIG.dressCode      || null,
      hashtag:          CONFIG.hashtag        || null,
      parentsInfo:      toArr(CONFIG.parentsInfo),
      sponsorsInfo:     toArr(CONFIG.sponsorsInfo),
      giftsInfo:        CONFIG.giftsInfo      || null,
      rsvpLabel:        CONFIG.rsvpLabel,
      rsvpValue:        CONFIG.rsvpValue      || null,
      rsvpDeadline:     toDate(CONFIG.rsvpDeadline),
      ceremonyVenue:    CONFIG.ceremonyVenue    || null,
      ceremonyAddress:  CONFIG.ceremonyAddress  || null,
      ceremonyTime:     CONFIG.ceremonyTime     || null,
      ceremonyMapUrl:   CONFIG.ceremonyMapUrl   || null,
      receptionVenue:   CONFIG.receptionVenue   || null,
      receptionAddress: CONFIG.receptionAddress || null,
      receptionTime:    CONFIG.receptionTime    || null,
      receptionMapUrl:  CONFIG.receptionMapUrl  || null,
      guestGreeting:    CONFIG.guestGreeting,
      defaultGuestName: 'Familia y Amigos',
      isPublished:      true,
    },
    select: { id: true, shareToken: true },
  })

  console.log(`  ✓ Invitación maestra creada → /invitacion/${inv.shareToken}`)
  return inv.id
}

// ═══════════════════════════════════════════════════════════════════════════
// PASO 4 — Crear InvitationGuest por cada invitado
// ═══════════════════════════════════════════════════════════════════════════

async function injectGuests(invitationId: string, dryRun: boolean) {
  let created = 0, errors = 0

  for (const { name, passes } of GUESTS) {
    const personalizedMessage = buildPersonalizedMessage(name, passes)

    if (dryRun) {
      console.log(`  [DRY RUN] "${name}" | ${passes} pase(s)`)
      created++
      continue
    }

    try {
      const guest = await prisma.invitationGuest.create({
        data: { invitationId, name, personalizedMessage },
        select: { token: true },
      })
      console.log(`  ✓ "${name}" (${passes} pase${passes > 1 ? 's' : ''}) → /g/${guest.token}`)
      created++
    } catch (err) {
      console.error(`  ✗ Error "${name}": ${err instanceof Error ? err.message : String(err)}`)
      errors++
    }
  }

  return { created, errors }
}

// ═══════════════════════════════════════════════════════════════════════════
// PASO 5 — Main
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('═'.repeat(60))
  console.log('  XV Años Grethel — Inyección de invitaciones')
  if (DRY_RUN) console.log('  🔍 MODO DRY-RUN — sin cambios en la BD')
  console.log('═'.repeat(60))
  console.log(`\n📋 Invitados embebidos: ${GUESTS.length}`)

  console.log('\n─── Paso 1: Cliente ─────────────────────────────────────')
  const clientId = await resolveClient(DRY_RUN)

  console.log('\n─── Paso 2: Limpieza previa ──────────────────────────────')
  await cleanPrevious(clientId, DRY_RUN)

  console.log('\n─── Paso 3: Invitación maestra (1 evento) ───────────────')
  const invitationId = await createMasterInvitation(clientId, DRY_RUN)

  console.log('\n─── Paso 4: Guests individuales ─────────────────────────')
  const { created, errors } = await injectGuests(invitationId, DRY_RUN)

  console.log('\n' + '═'.repeat(60))
  console.log(`✅ 1 evento | ${created} guests creados | ${errors} errores`)
  if (DRY_RUN) console.log('   (dry-run: sin cambios reales)')
  console.log('═'.repeat(60))
}

main()
  .catch(e => { console.error('Error fatal:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
