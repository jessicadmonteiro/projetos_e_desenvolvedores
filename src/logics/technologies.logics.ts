import { Request, Response } from "express"
import { client } from "../database"
import { QueryConfig } from "pg"

const createTechnology = async (req: Request, res: Response): Promise<Response> => {
  const id: number = parseInt(req.params.id)
  const data = req.body
  const date: Date = new Date()

  const queryProject: string = `
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

  const queryConfigProject: QueryConfig = {
    text:queryProject,
    values: [id]
  }

  const queryResultProject = await client.query(queryConfigProject)

  const nameExist = queryResultProject.rows.find((element) => element.technologyName === data.name)
  
  if(nameExist !== undefined){
    return res.status(404).json({
      message: "technology already exists in this project!"
    })
  }

  let queryString: string = `
    SELECT
      *
    FROM
      technologies
    WHERE 
      "technologyName" = $1;
  `

  let queryConfig: QueryConfig = {
    text: queryString,
    values:[data.name]
  }

  const queryResult = await client.query(queryConfig)

  if(queryResult.rowCount === 0){
    return res.status(404).json({
      message: "Technology not found!"
    })
  }

  queryString = `
    INSERT INTO
      projects_technologies("addedIn","projectId", "technologyId")
    VALUES($1, $2, $3);
  `

  queryConfig = {
    text: queryString,
    values: [date, id, queryResult.rows[0].technologyId]
  }

  await client.query(queryConfig)
  

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

  const queryResultSelect = await client.query(selectQueryConfig)

  const index: number = queryResultSelect.rows.length -1

  return res.status(201).json(queryResultSelect.rows[index])
}

const deleteTech = async ( req: Request, res: Response): Promise<Response> => {
  const nameTechnology: string = req.params.name

  try {
    const idProject: number = parseInt(req.params.id)

    let queryStringTech: string = `
    SELECT
      *
    FROM
      technologies
    WHERE 
      "technologyName" = $1;
  `

  let queryConfigTech: QueryConfig = {
    text: queryStringTech,
    values:[nameTechnology]
  }

  const queryResult = await client.query(queryConfigTech)

  if(queryResult.rowCount === 0){
    return res.status(404).json({
      message: "Technology not supported",
      options: [
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
    })
  }
    
    const queryProject: string = `
      SELECT 
        pr.*,
        pt.*,
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

  const queryConfigProject: QueryConfig = {
    text:queryProject,
    values: [idProject]
  }

  const queryResultProject = await client.query(queryConfigProject)

  const project = queryResultProject.rows.find((element) => element.technologyName === nameTechnology)

  const queryString: string = `
      DELETE FROM
        projects_technologies
      WHERE
        "id" = $1 
    `
    const queryConfig: QueryConfig = {
      text: queryString,
      values: [project.id]
    }
  
    await client.query(queryConfig)

    return res.status(204).send()
    
  } catch (error: any) {
    console.log(error.message)

    if(error.message === `Cannot read properties of undefined (reading 'id')`){
      return res.status(404).json({
        message: `Technology ${nameTechnology} not found on this Project.`
      })
    }
    return res.status(500)
  }

 
}


export {
  createTechnology,
  deleteTech
}