import { deviceAuthSessions } from "../db"

export const deviceQueryRepository = {
    async getCurrentIssuedAt(deviceId: string) {
        const result = await deviceAuthSessions.findOne({'deviceInfo.deviceId': deviceId})
        return result!.issuedAt
    },

    async getSessionsForUser(userId: string) {
        const result = await deviceAuthSessions.find({"userInfo.userId": userId}).toArray()
        return result
    }
}