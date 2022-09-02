interface joinRoom {
    roomId: string,
    users: string[]
}

interface createNamespace {
    userSub: { userSub: string }
}
export default joinRoom;
export { createNamespace };