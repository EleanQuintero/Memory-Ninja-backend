import { RowDataPacket } from "mysql2"

export interface latestFlashcardsData extends RowDataPacket {
    question: string
    theme_name: string
    created_at: Date

}