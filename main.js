const { DisconnectReason, makeWASocket, useMultiFileAuthState, MessageType, MessageOptions, Mimetype } = require('@whiskeysockets/baileys')
const validPlnFunc = require('./Function/valid_pln')

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
        const message = msg.message.conversation

        if (!msg.key.fromMe) {
            if(message.toLocaleLowerCase() === 'saldo') {
                await sock.readMessages([msg.key])
                const date = new Date().toLocaleString('id-US', { timeZone: 'Asia/Jakarta' })
                await sock.sendMessage(sender, { text: `Hai ${sender_name}\nSisa saldo kamu saat ini adalah Rp. 200.000\n\n_Updated at_ _:_ _${date}_` }, { quoted: msg })
            
            } else if(message.startsWith('pln')) {
                await sock.readMessages([msg.key])
                const idPelanggan = message.split(' ')[1]
                
                const plnData = await validPlnFunc(idPelanggan)

                const date = new Date().toLocaleString('id-US', { timeZone: 'Asia/Jakarta' })
                await sock.sendMessage(sender, { text: `Hai ${sender_name}\n\nCustomer number : ${plnData.customer_no}\nCustomer name : ${plnData.name}\nSegment Power : ${plnData.segment_power}\n\n_Updated at_ _:_ _${date}_` }, { quoted: msg })
            }
        }
    })
}

connectToWhatsApp()