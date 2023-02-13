import { Request, Response } from "express"
import {iTechnologyRequest} from "../interfaces/technologies.interfeces"
import { client } from "../database"
import { QueryConfig } from "pg"


const createTechnology = async (req: Request, res: Response): Promise<Response> => {
  const id: number = parseInt(req.params.id)
  const date: Date = new Date()

  const data = req.body
    
  const necessaryData: iTechnologyRequest = {
    technologyName: data.name,
  }

  const datasValues = [
    "JavaScript", 
    "Python", 
    "React", 
    "Express.js", 
    "HTML", 
    "CSS", 
    "Django", 
    "PostgreSQL", 
    "MongoDB"
  ]

  const validate = datasValues.find((e) => e === necessaryData.technologyName)
  if(validate === undefined){
    return res.status(400).json({
      message: "Technology not supported.",
      options: `[${datasValues}]`
    })
  }

  let queryString: string = `
    SELECT
      *
    FROM
      technologies;
  `

  await client.query(queryString)

  const queryStringTechnology = `
    INSERT INTO
      technologies("technologyName")
    VALUES
      ($1)
    RETURNING *;
  `
  const queryConfigTechnology: QueryConfig = {
    text: queryStringTechnology,
    values: [necessaryData.technologyName]
  }
  const queryTechnology = await client.query(queryConfigTechnology)



  queryString = `
    INSERT INTO
      projects_technologies("addedIn","projectId", "technologyId" )
    VALUES
      ($1, $2, $3)
    RETURNING *;
  `
  let queryConfig: QueryConfig = {
    text: queryString,
    values: [date, id, queryTechnology.rows[0].technologyId]
  }

  const projectTechnology =  await client.query(queryConfig)
  

  const selectQueryString = `
    SELECT 
    te."technologyId" ,
    te."technologyName",
    pr."projectID",
    pr."projectName",
    pr."projectDescription",
    pr."projectEstimatedTime",
    pr."projectRepository",
    pr."projectStartDate",
    pr."projectEndDate"
    FROM 
      projects_technologies pt
    FULL JOIN projects pr ON pt."projectId" = pr."projectID"
    FULL JOIN technologies te ON pt."technologyId" = te."technologyId"
    WHERE pr."projectID" = $1;
  `

  const selectQueryConfig: QueryConfig = {
    text: selectQueryString,
    values: [id]
  }

  const queryResult = await client.query(selectQueryConfig)

  return res.status(201).json(queryResult.rows[0])
}

const deleteProject = async ( req: Request, res: Response): Promise<Response> => {
  const idProject: number = parseInt(req.params.id)
  const nameTechnology: string = req.params.name


  const selectqueryString: string = `
    SELECT 
      *
    FROM 
      projects_technologies pt
    FULL JOIN 
      technologies te ON pt."technologyId" = te."technologyId"
    WHERE pt."projectId" = $1;
  `

  const queryConfigSelect: QueryConfig = {
    text: selectqueryString,
    values: [idProject]
  }

  const queryResultSelect = await client.query(queryConfigSelect)

  const queryString: string = `
    DELETE FROM
      technologies
    WHERE
      "technologyId" = $1
  `
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [queryResultSelect.rows[0].technologyId]
  }

  await client.query(queryConfig)

  return res.status(204).send()
}


export {
  createTechnology,
  deleteProject
}