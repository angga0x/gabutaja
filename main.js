const { DisconnectReason, makeWASocket, useMultiFileAuthState, MessageType, MessageOptions, Mimetype } = require('@whiskeysockets/baileys')

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state
    })

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to', lastDisconnect.error, ', reconnecting', shouldReconnect)
            if (shouldReconnect) {
                connectToWhatsApp()
            }
        } else if (connection === 'open') {
            console.log('opened connection')
        }
    })

    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0]

        const sender = msg.key.remoteJid
        const sender_num = msg.key.remoteJid.replace('@s.whatsapp.net', '')
        const sender_name = msg.pushName
        const message = msg.message.conversation || msg.message.extendedTextMessage.text
        
        if (message === 'Hai') {
            await sock.sendMessage(sender, { text: 'Hai juga' })
        }
    })
}

connectToWhatsApp()