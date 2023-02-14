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
            pr.*,
            te."technologyId",
            te."technologyName"
        FROM 
            projects_technologies pt
        FULL JOIN 
            projects pr ON pt."projectId" = pr."projectID"
        LEFT JOIN 
            technologies te ON pt."technologyId" = te."technologyId";
    `
     const queryResult: ProjectResult = await client.query(queryString)

     return res.json(queryResult.rows)
}

const retriveProject = async (req: Request, res: Response): Promise<Response> => {
    
    const id: number =  parseInt(req.params.id)

    const queryString = `
        SELECT 
            pr.*,
            te."technologyId",
            te."technologyName"
        FROM 
            projects pr 
        FULL JOIN 
            projects_technologies pt ON pt."projectId" = pr."projectID"
        FULL JOIN 
            technologies te ON pt."technologyId" = te."technologyId"
        WHERE pr."projectID"  = $1;
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
        const id: number    = parseInt(req.params.id)

        const queryStringProject: string = `
            SELECT
                *
            FROM
                projects
            WHERE "projectID" = $1;

        `
        const queryConfigProject: QueryConfig = {
            text: queryStringProject,
            values: [id]
        }

        const queryResultProject = await client.query(queryConfigProject)

        let data = req.body

        data = {
            projectName: data.name || queryResultProject.rows[0].projectName,
            projectDescription: data.description || queryResultProject.rows[0].projectDescription,
            projectEstimatedTime: data.estimatedTime || queryResultProject.rows[0].estimatedTime,
            projectRepository: data.repository || queryResultProject.rows[0].projectRepository,
            projectStartDate: data.startDate || queryResultProject.rows[0].projectStartDate,
            projectEndDate: data.endDate || queryResultProject.rows[0].projectEndDate,
            developerId: data.developerId || queryResultProject.rows[0].developerId
        }
      
        
        const projectKeys   = Object.keys(data)
        const projectValues = Object.values(data)

        const queryString: string = format(
        `
            UPDATE
                projects
            SET (%I) = ROW(%L)
            WHERE
                "projectID" = $1
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

        return res.status(200).json(queryResult.rows[0])
        
    } catch (error: any) {
        console.log(error.message)

        if(error.message === `null value in column "projectEstimatedTime" of relation "projects" violates not-null constraint`){
            return res.status(400).json({
                message: "At least one of those keys must be send.",
                keys: 
                  " name, description, estimatedTime, repository, startDate, endDate, developerId."
                })
        }
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