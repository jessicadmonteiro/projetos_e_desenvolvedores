import { QueryResult } from "pg"

interface iDeveloperRequest {
    "developerName": string
    "developerEmail": string
}

interface iDeveloper extends iDeveloperRequest {
    "developerID": number
}

type DeveloperResult = QueryResult<iDeveloper>


interface iDeveloperInfosRequest {
    "developerInfoDeveloperSince": Date
    "developerInfoPreferredOS": string
}

interface iDeveloperInfos extends iDeveloperInfosRequest {
    "developerInfoId": number
}

type DeveloperInfosResult = QueryResult<iDeveloperInfos>



export {
    iDeveloperRequest, 
    iDeveloper, 
    DeveloperResult, 
    iDeveloperInfosRequest,
    iDeveloperInfos,
    DeveloperInfosResult,

}