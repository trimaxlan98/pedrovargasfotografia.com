import 'dotenv/config'
import app from './app'
import { startArchivalWorkflow } from './services/archivalService'

const PORT = Number(process.env.PORT) || 3001
const stopArchivalWorkflow = startArchivalWorkflow()

const server = app.listen(PORT, () => {
  console.log(`\n🎯 Pedro Vargas Fotografía API`)
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`)
  console.log(`📡 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
  console.log(`📋 Health: http://localhost:${PORT}/api/health\n`)
})

process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando servidor...')
  stopArchivalWorkflow()
  server.close(() => {
    console.log('Servidor cerrado.')
    process.exit(0)
  })
})

process.on('unhandledRejection', (reason) => {
  console.error('Promesa rechazada sin manejar:', reason)
})

export default server
