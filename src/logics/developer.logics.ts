import { Request, Response } from "express"
import {
  DeveloperInfosResult,
  DeveloperResult,
  iDeveloperRequest,
} from "../interfaces/developer.interfaces"
import format from "pg-format"
import { client } from "../database"
import { QueryConfig } from "pg"

const createDeveloper = async ( req: Request, res: Response): Promise<Response> => {
  try {
    const data = req.body

    const necessaryData = {
      developerName: data.name,
      developerEmail: data.email,
    }

    const developerData: iDeveloperRequest = necessaryData;

    const queryString: string = format(
      `
                INSERT INTO
                    developers(%I)
                VALUES(%L)
                RETURNING*;
            `,
      Object.keys(developerData),
      Object.values(developerData)
    )

    const queryResult: DeveloperResult = await client.query(queryString)

    return res.status(201).json(queryResult.rows[0])

  } catch (error: any) {
    if (
      error.message ===
      `null value in column "email" of relation "developers" violates not-null constraint`
    ) {
      return res.status(400).json({ message: "Missing required keys: email." })
    }

    if (
      error.message ===
      `null value in column "developerName" of relation "developers" violates not-null constraint`
    ) {
      return res.status(400).json({ message: "Missing required keys: name." })
    }

    if (
      error.message ===
      `null value in column "developerEmail" of relation "developers" violates not-null constraint`
    ) {
      return res.status(400).json({ message: "Missing required keys: email." })
    }

    if (error instanceof Error) {
      return res.status(400).json({ message: error.message })
    }

    console.error(error);
    return res.status(500).json({ message: error })
  }
}

const readDeveloper = async ( req: Request, res: Response): Promise<Response> => {
  const queryString = `
    SELECT 
        de.*,
        di."developerInfoDeveloperSince",
        di."developerInfoPreferredOS"
    FROM 
        developers de
    LEFT JOIN 
        developer_infos di ON de."developerInfoId" = di."developerInfoId";
    `

  const queryResult: DeveloperInfosResult = await client.query(queryString)
  return res.json(queryResult.rows)
}

const retriveDeveloper = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id: number = parseInt(req.params.id)

    const queryString = `
      SELECT 
      de.*,
      di."developerInfoDeveloperSince",
      di."developerInfoPreferredOS"
      FROM 
        developers de
      LEFT JOIN 
        developer_infos di ON de."developerInfoId" = di."developerInfoId"
      WHERE
      de."developerID" = $1;
    `

    const queryConfig: QueryConfig = {
      text: queryString,
      values: [id],
    }

    const queryResult: DeveloperInfosResult = await client.query(queryConfig);
    return res.json(queryResult.rows[0])

  } catch (error: any) {
    console.error(error)
    return res.status(500).json({ message: error })
  }
}

const retriveProjectsDeveloper = async (req: Request, res: Response): Promise<Response> => {

  try {
    const id: number = parseInt(req.params.id)

    const queryString: string = `
      SELECT 
        d.*,
        di."developerInfoDeveloperSince",
        di."developerInfoPreferredOS",
        p."projectID",
        p."projectName",
        p."projectDescription",
        p."projectEstimatedTime",
        p."projectRepository",
        p."projectStartDate",
        p."projectEndDate",
        te.*
      FROM 
          projects p 
      JOIN 
          developers d  ON p."developerId" = d."developerID" 
      FULL JOIN 
          projects_technologies pt ON pt."projectId" = p."projectID"
      FULL JOIN 
          technologies te ON pt."technologyId" = te."technologyId"
      FULL JOIN 
          developer_infos di ON d."developerInfoId" = di."developerInfoId"
      WHERE 
          "developerId"  = $1;
    `
  
    const queryConfig: QueryConfig = {
      text: queryString,
      values: [id],
    }
  
    const queryResult = await client.query(queryConfig)
  
    return res.json(queryResult.rows)
    
  } catch (error: any) {
    console.log(error.message)

    return res.status(500).json({message: error.message})
    
  }
 
} 

const updateDeveloper = async (req: Request, res: Response): Promise<Response> => {
  try {
    const data = req.body

    const necessaryName = {
      developerName: data.name,
    }

    const necessaryEmail = {
      developerEmail: data.email,
    }

    const id: number = parseInt(req.params.id)
    const developerKeys = Object.keys(necessaryName || necessaryEmail)
    const developerValues = Object.values(necessaryName || necessaryEmail)

    const queryString: string = format(
      `
      UPDATE
        developers
      SET(%I) = ROW(%L)
      WHERE
        "developerID" = $1
      RETURNING *;
    `,
      developerKeys,
      developerValues
    )

    const queryConfig: QueryConfig = {
      text: queryString,
      values: [id],
    }

    const queryResult: DeveloperResult = await client.query(queryConfig)

    return res.status(200).json(queryResult.rows[0])

  } catch (error: any) {

    if (
      error.message ===
      `null value in column "developerName" of relation "developers" violates not-null constraint`
    ) {
      return res.status(400).json({
        message: `At least one of those keys must be send.
      keys: [ name, mail ]`,
      })
    }

    console.error(error);
    return res.status(500).json({ message: error })
  }
}

const deleteDeveloper = async (req: Request, res: Response): Promise<Response> => {
  const id: number = parseInt(req.params.id)

  const queryString: string = `
    DELETE FROM
        developers
    WHERE
        "developerID" = $1;
    
  `

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  }

  await client.query(queryConfig)

  return res.status(204).send()
}

export {
  createDeveloper,
  retriveDeveloper,
  readDeveloper,
  updateDeveloper,
  deleteDeveloper,
  retriveProjectsDeveloper,
}
