
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const clientId = 'cmmo6v77s0001tua3v3xfkx9e'; // ID from previous step

  console.log('--- Creando Invitaciones Generales ---');

  // 1. Boda de Sofía y Mateo (General)
  const bodaSofiaMateo = await prisma.digitalInvitation.create({
    data: {
      clientId,
      eventType: 'Boda',
      title: 'Nuestra Boda',
      names: 'Sofía & Mateo',
      eventDate: '2026-10-15',
      eventTime: '18:00',
      venue: 'Hacienda Los Laureles',
      locationNote: 'Queremos compartir este día tan especial con ustedes.',
      message: 'Después de 8 años de caminar juntos, hemos decidido dar el siguiente paso.',
      quote: 'El amor no consiste en mirarse el uno al otro, sino en mirar juntos en la misma dirección.',
      hashtag: '#BodaSofiaYMateo',
      template: 'minimalista',
      primaryColor: '#2c3e50',
      textColor: '#ffffff',
      fontStyle: 'serif',
      isDark: true,
      dressCode: 'Formal / Gala',
      rsvpLabel: 'Confirmar Asistencia',
      rsvpValue: '5512345678',
      invitationType: 'general',
      heroImage: 'https://images.unsplash.com/photo-1519741497674-611481863552',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc'
      ]),
      ceremonyVenue: 'Parroquia de San Juan',
      ceremonyAddress: 'Calle Principal 123, Centro Histórico',
      ceremonyTime: '17:00',
      ceremonyMapUrl: 'https://maps.google.com/?q=Parroquia+San+Juan',
      receptionVenue: 'Hacienda Los Laureles',
      receptionAddress: 'Carretera Nacional Km 15.5',
      receptionTime: '19:30',
      receptionMapUrl: 'https://maps.google.com/?q=Hacienda+Los+Laureles',
      parentsInfo: JSON.stringify(['Sra. Elena García & Sr. Ricardo Paz', 'Sra. Martha Ruiz & Sr. Alberto Sosa']),
      giftsInfo: 'Tu presencia es nuestro mejor regalo, pero si deseas tener un detalle: Cuenta CLABE 0123 4567 8901 2345.',
      instagramHandle: '@sofia_y_mateo_boda',
      isPublished: true,
      guests: {
        create: [
          { name: 'Familia Ramírez López' },
          { name: 'Dr. Julián Sotomayor' },
          { name: 'Amigos de la Universidad' }
        ]
      }
    }
  });
  console.log('✅ Creada: Boda de Sofía y Mateo (General)');

  // 2. XV Años de Valeria (General)
  const xvValeria = await prisma.digitalInvitation.create({
    data: {
      clientId,
      eventType: 'XV Años',
      title: 'Mis XV Años',
      names: 'Valeria Martínez',
      eventDate: '2026-08-22',
      eventTime: '20:00',
      venue: 'Salón de Eventos Royal',
      message: 'Acompáñame a celebrar una noche mágica llena de sueños y alegría.',
      quote: 'Ayer una niña, hoy una joven, siempre tu pequeña.',
      hashtag: '#MisXVValeria',
      template: 'floral',
      primaryColor: '#f8bbd0',
      textColor: '#4a148c',
      fontStyle: 'cursive',
      isDark: false,
      dressCode: 'Etiqueta',
      rsvpLabel: 'WhatsApp para confirmar',
      rsvpValue: '5598765432',
      invitationType: 'general',
      heroImage: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e',
      ceremonyVenue: 'Catedral Metropolitana',
      ceremonyAddress: 'Zócalo Capitalino',
      ceremonyTime: '18:30',
      receptionVenue: 'Salón Royal Garden',
      receptionAddress: 'Av. de los Insurgentes 450',
      receptionTime: '21:00',
      parentsInfo: JSON.stringify(['Sra. Patricia Luna & Sr. Fernando Martínez']),
      sponsorsInfo: JSON.stringify(['Sr. Jorge Luna & Sra. Beatriz Vega (Padrinos de Brindis)']),
      isPublished: true,
      guests: {
        create: [
          { name: 'Tía Mary y Primos' },
          { name: 'Compañeros del Colegio' }
        ]
      }
    }
  });
  console.log('✅ Creada: XV Años de Valeria (General)');

  console.log('\n--- Creando Invitaciones Personalizadas ---');

  // 3. Graduación de Alejandro (Personalizada)
  const gradAlejandro = await prisma.digitalInvitation.create({
    data: {
      clientId,
      eventType: 'Graduación',
      title: 'Mi Graduación',
      names: 'Alejandro Torres',
      eventDate: '2026-07-10',
      eventTime: '19:00',
      venue: 'Auditorio Universitario',
      message: 'Gracias por ser parte de este logro profesional. ¡Lo logramos!',
      template: 'moderno',
      primaryColor: '#1a237e',
      textColor: '#ffffff',
      fontStyle: 'sans-serif',
      invitationType: 'individual',
      heroImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
      ceremonyVenue: 'Auditorio Magno - UNAM',
      ceremonyTime: '17:00',
      receptionVenue: 'Restaurante El Cardenal',
      receptionTime: '21:00',
      isPublished: true,
      guests: {
        create: [
          { 
            name: 'Sr. Roberto Torres', 
            personalizedMessage: 'Papá, gracias por todo tu apoyo incondicional para terminar mi carrera.'
          },
          { 
            name: 'Lic. Claudia Mendez', 
            personalizedMessage: 'Claudia, fuiste una pieza clave en mi formación, me encantaría que me acompañaras.' 
          }
        ]
      }
    }
  });
  console.log('✅ Creada: Graduación de Alejandro (Personalizada)');

  // 4. Bautizo de Santiago (Personalizada)
  const bautizoSantiago = await prisma.digitalInvitation.create({
    data: {
      clientId,
      eventType: 'Bautizo',
      title: 'Bautizo de Santiago',
      names: 'Santiago Herrera',
      eventDate: '2026-05-30',
      eventTime: '12:00',
      venue: 'Capilla San Francisco',
      message: 'Hoy recibo mi primer sacramento y quiero que estés presente.',
      template: 'infantil',
      primaryColor: '#e3f2fd',
      textColor: '#1565c0',
      fontStyle: 'sans-serif',
      invitationType: 'individual',
      heroImage: 'https://images.unsplash.com/photo-1519689680058-324335c77eba',
      ceremonyVenue: 'Capilla de San Francisco de Asís',
      ceremonyAddress: 'Colonia Del Valle',
      ceremonyTime: '11:00',
      receptionVenue: 'Jardín Las Rosas',
      receptionAddress: 'Calle de los Olivos 78',
      receptionTime: '13:00',
      parentsInfo: JSON.stringify(['Andrea & Luis (Papás)']),
      sponsorsInfo: JSON.stringify(['Lucía & Manuel (Padrinos)']),
      isPublished: true,
      guests: {
        create: [
          { 
            name: 'Abuelos Maternos', 
            personalizedMessage: 'Abuelitos, su amor es mi guía, los espero para celebrar mi bautizo.' 
          },
          { 
            name: 'Madrina Lucía', 
            personalizedMessage: 'Lucy, gracias por aceptar ser mi guía espiritual en este camino.' 
          }
        ]
      }
    }
  });
  console.log('✅ Creada: Bautizo de Santiago (Personalizada)');

  console.log('\n🎉 ¡Invitaciones creadas con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
