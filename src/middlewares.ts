import { Request, Response, NextFunction } from "express"
import { QueryConfig } from "pg"
import { client } from "./database"
import { DeveloperResult } from "./interfaces/developer.interfaces"

const ensureDeveloperExists = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const id: number = parseInt(req.params.id)

  const queryString: string = `
    SELECT
        COUNT(*)
    FROM
        developers
    WHERE
    "developerID" = $1;
  `

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  }

  const queryResult = await client.query(queryConfig)

  if (Number(queryResult.rows[0].count) > 0) {
    return next()
  }

  return res.status(404).json({
    message: "Developer not found",
  })
}

const developerDatasUnique = async ( req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const dataBase: string = `
    SELECT
        *
    FROM
        developers;
  `

  const listDevelopers: DeveloperResult = await client.query(dataBase)

  const email = listDevelopers.rows
    .map((element) => element.developerEmail)
    .find((element) => element === req.body.email)

  if (email !== undefined) {
    return res.status(409).json({
      message: "Email already exists.",
    })
  }

  next()
}

const ensureProjectExists = async ( req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const id: number = parseInt(req.params.id)

  const queryString: string = `
    SELECT
        COUNT(*)
    FROM
      projects
    WHERE
    "projectID" = $1;
  `

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  }

  const queryResult = await client.query(queryConfig)

  if (Number(queryResult.rows[0].count) > 0) {
    return next();
  }

  return res.status(404).json({
    message: "Project not found",
  })
}

export { 
  ensureDeveloperExists, 
  developerDatasUnique, 
  ensureProjectExists 
}
