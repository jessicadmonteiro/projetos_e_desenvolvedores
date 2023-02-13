import { json, Request, Response } from "express"
import format from "pg-format"
import {iProjectRequest, ProjectResult} from "../interfaces/projects.interfaces"
import { client } from "../database"
import { QueryConfig } from "pg"

const createProject = async (req: Request, res: Response): Promise<Response> => {
    try {
        const data = req.body
    
        const necessaryData = {
            projectName: data.name,
            projectDescription: data.description,
            projectEstimatedTime: data.estimatedTime,
            projectRepository: data.repository,
            projectStartDate: data.startDate,
            projectEndDate: data.endDate,
            developerId: data.developerId
        }

        const projectData: iProjectRequest = necessaryData

        const queryString: string = format(
            `
                INSERT INTO
                    projects(%I)
                VALUES(%L)
                RETURNING *;
            `,
            Object.keys(projectData),
            Object.values(projectData)
        )
        
        const queryResult: ProjectResult = await client.query(queryString)

        return res.status(201).json(queryResult.rows[0])


    } catch (error: any) {
      
        if(error.message === `insert or update on table "projects" violates foreign key constraint "projects_developerId_fkey"`){
            return res.status(404).json({
                message: "Developer not found."
            })
        }

        if(error.message === `null value in column "projectDescription" of relation "projects" violates not-null constraint` || `null value in column "projectName" of relation "projects" violates not-null constraint`){
            return res.status(400).json({
                message: "Missing required keys: description,estimatedTime, repository, startDate."
            })
        }
        
        return res.status(500).json({ message: error })
    }
}

const readProject = async (req: Request, res: Response): Promise<Response> => {

    const queryString = `
        SELECT
            *
        FROM
            projects;

    `
     const queryResult: ProjectResult = await client.query(queryString)

     return res.json(queryResult.rows)
}

const retriveProject = async (req: Request, res: Response): Promise<Response> => {
    
    const id: number =  parseInt(req.params.id)

    const queryString = `
        SELECT
            *
        FROM
            projects 
        WHERE 
            projects."projectID" = $1
    `
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id],
    }
    
    const queryResult: ProjectResult = await client.query(queryConfig)

    return res.json(queryResult.rows)

}

const updateProject = async (req: Request, res: Response): Promise<Response> => {
    try {
        const data = req.body
      
        const name = {projectName: data.name }
        const description = { projectDescription: data.description }
        const estimatedTime= { projectEstimatedTime: data.estimatedTime }
        const repository = { projectRepository: data.repository }
        const startDate = { projectStartDate: data.startDate }
        
        const id: number    = parseInt(req.params.id)
        const projectKeys   = Object.keys(name || description || estimatedTime || repository || startDate)
        const projectValues = Object.values(name || description || estimatedTime || repository || startDate)


        const queryString: string = format(
        `
            UPDATE
                projects
            SET 
                $1
            WHERE
                "projectID" = $2
            RETURNING *;
        `,
            projectKeys,
            projectValues
        )

        const queryConfig: QueryConfig = {
            text: queryString,
            values:[id]
        }

        const queryResult: ProjectResult = await client.query(queryConfig)

        console.log(queryResult)

        return res.status(200).json(queryResult.rows[0])
        
    } catch (error: any) {
        console.log(error.message)
        return res.status(500).json({ message: error })
    }
    

}

const deleteProject = async (req:Request, res: Response): Promise<Response> => {
    const id: number = parseInt(req.params.id)

    const queryString: string = `
        DELETE FROM
            projects
        WHERE
        "projectID" = $1;
    `
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    }

    await client.query(queryConfig)
    
    return res.status(204).send()
}

export { 
    createProject,
    readProject,
    retriveProject,
    updateProject,
    deleteProject
}