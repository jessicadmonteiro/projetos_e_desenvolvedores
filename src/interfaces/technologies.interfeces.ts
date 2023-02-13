import { QueryResult } from "pg"

interface iTechnologyRequest {
    technologyName: string
}

interface iTechnologies extends iTechnologyRequest {
    technologyId: number
}

interface iTechnology {
    id: number
    addedIn: Date
    projectId: number
    technologyId: number
}

type TechnologiesResult = QueryResult<iTechnology>


export {
    iTechnologyRequest,
    iTechnology,
    iTechnologies,
    TechnologiesResult
}