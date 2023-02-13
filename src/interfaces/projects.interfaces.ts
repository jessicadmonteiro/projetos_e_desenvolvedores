import { QueryResult } from "pg"

interface iProjectRequest {
    projectName: string
    projectDescription: string
    projectEstimatedTime: string
    projectRepository: string
    projectStartDate: Date
    projectEndDate: Date | null
    developerId: number
}

interface iProject extends iProjectRequest {
    projectID: number
}

type ProjectResult = QueryResult<iProject>

export{
    iProjectRequest,
    iProject,
    ProjectResult
}