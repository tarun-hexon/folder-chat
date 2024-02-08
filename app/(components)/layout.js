import ChatAuth from './chatAuth';

export default async function RootLayout({ children }) {

return await ChatAuth({children})
}
