export interface VerifiedToken {
    azp: string
    exp: number
    fea: string
    fva: [number, number]
    iat: number
    iss: string
    jti: string
    nbf: number
    pla: string
    publicMetadata: {
        onboarding: boolean
    }
    sid: string
    sub: string
    v: number
}
