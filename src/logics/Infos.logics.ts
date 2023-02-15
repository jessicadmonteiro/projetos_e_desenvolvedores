import { Request, Response } from "express"
import {
  DeveloperResult,
  DeveloperInfosResult,
  iDeveloperInfosRequest,
} from "../interfaces/developer.interfaces"
import format from "pg-format"
import { client } from "../database"
import { QueryConfig } from "pg"

const createDeveloperInfo = async ( req: Request, res: Response): Promise<Response> => {
  try {
    const id: number  = parseInt(req.params.id)
    const data = req.body

    const necessaryData = {
      developerInfoDeveloperSince: data.developerSince,
      developerInfoPreferredOS: data.preferredOS,
    }

    const developerInfoData: iDeveloperInfosRequest = necessaryData

    const queryStringDeveloper: string = `
      SELECT 
        * 
      FROM  
        developers
      WHERE 
        "developerID" = $1;
   `
   const queryConfigDeveloper: QueryConfig = {
    text: queryStringDeveloper,
    values: [id]
  }

   const queryResultDeveloper = await client.query(queryConfigDeveloper)

   const validateInfos = queryResultDeveloper.rows[0].developerInfoId
  
   if(validateInfos !== null){
    return res.status(400).json({
      message: "Developer infos already exists."
    })
   }

    let queryString: string = format(
    `
      INSERT INTO 
          developer_infos(%I)
      VALUES (%L)
      RETURNING *;
    `,
      Object.keys(developerInfoData),
      Object.values(developerInfoData)
    )

    let queryResult: DeveloperInfosResult = await client.query(queryString)

    queryString = `
      UPDATE
          developers
      SET
          "developerInfoId" = $1
      WHERE
      "developerID" = $2
      RETURNING *;
    `

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [queryResult.rows[0].developerInfoId, id],
  }

  await client.query(queryConfig)

  return res.status(201).json(queryResult.rows[0])

  } catch (error: any) {
    const data = req.body

    const necessaryData = {
      developerInfoPreferredOS: data.preferredOS,
    }

    const value = Object.values(necessaryData)

    if(error.message ===`invalid input value for enum "OS": "${value}"` ){
      return res.status(400).json({
          message:" Invalid OS option.",
          options: "[ Windows, Linux, MacOS]"
      })
    }
   

    if (error instanceof Error) {
      return res
        .status(400)
        .json({
          message: "Missing required keys: developerSince, preferredOS.",
        })
    }

    console.error(error);
    return res.status(500).json({ message: error })
  }
}

const updateDeveloperInfo = async ( req: Request, res: Response): Promise<Response> => {

try {
  const id: number  = parseInt(req.params.id)

  const queryDeveloperInfo: string = `
    SELECT
      *
    FROM 
      developers d
    JOIN
      developer_infos di ON d."developerID" = di."developerInfoId"
    WHERE 
      d."developerID" = $1;
  `

  const queryConfigDeveloperInfo: QueryConfig = {
    text: queryDeveloperInfo,
    values: [id]
  }

  const queryResultDeveloperInfo = await client.query(queryConfigDeveloperInfo)

  const data = req.body;
  const necessaryData = {
    developerInfoPreferredOS: data.preferredOS || queryResultDeveloperInfo.rows[0].developerInfoPreferredOS,
    developerInfoDeveloperSince: data.developerSince || queryResultDeveloperInfo.rows[0].developerInfoDeveloperSince
  }

  const developerInfoKeys = Object.keys(necessaryData );
  const developerInfoValues = Object.values(necessaryData );

    const queryStringDeveloper: string = `
      SELECT
        *
      FROM 
        developers
      WHERE
        "developerID" = $1
    `
    const queryConfigDeveloper: QueryConfig = {
      text: queryStringDeveloper,
      values: [id]
    }
    const queryResultDeveloper: DeveloperInfosResult = await client.query(queryConfigDeveloper)

    const idInfo = queryResultDeveloper.rows[0].developerInfoId

    const queryString: string = format(
      `
        UPDATE
          developer_infos
        SET(%I) = ROW(%L)
        WHERE
        "developerInfoId" = $1
        RETURNING *;
      `,
      developerInfoKeys,
      developerInfoValues
    )

    const queryConfig: QueryConfig = {
      text: queryString,
      values: [idInfo],
    }

    const queryResult: DeveloperResult = await client.query(queryConfig);

    return res.status(200).json(queryResult.rows[0]);
  
} catch (error: any) {
  if(error.message === `null value in column "developerInfoPreferredOS" of relation "developer_infos" violates not-null constraint`){

    return res.status(400).json({
      message: "At least one of those keys must be send.",
      keys: "[ developerSince, preferredOS]"
    })
    
  }

  const data = req.body

  const necessaryData = {
    developerInfoPreferredOS: data.preferredOS,
  }

  const value = Object.values(necessaryData)

  if(error.message === `invalid input value for enum "OS": "${value}"`){
    return res.status(400).json({
      message: "Invalid OS option.",
      options: "[ Windows, Linux, MacOS ]"
    })
  }

  console.error(error)
  return res.status(500).json({ message: error })
}
  

}

export { createDeveloperInfo, updateDeveloperInfo };

