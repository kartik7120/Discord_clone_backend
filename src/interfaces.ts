interface joinRoom {
    roomId: string,
    users: string[],
    userSub: string,
    userPicture: string,
    userName: string
}

interface createNamespace {
    userSub: { userSub: string }
}
export default joinRoom;
export { createNamespace };