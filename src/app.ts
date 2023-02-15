import express, {Application} from "express"
import startDatabase  from "./database/connection"
import {createDeveloper, deleteDeveloper, readDeveloper, retriveDeveloper, retriveProjectsDeveloper, updateDeveloper} from "./logics/developer.logics"
import {createDeveloperInfo, updateDeveloperInfo} from "./logics/Infos.logics"
import { developerDatasUnique, ensureDeveloperExists, ensureProjectExists } from "./middlewares"
import {createProject, deleteProject, readProject, retriveProject, updateProject} from "./logics/projects.logics"
import {createTechnology, deleteTech} from "./logics/technologies.logics"

const app: Application = express()
app.use(express.json())

app.post("/developers", developerDatasUnique, createDeveloper)
app.get("/developers", readDeveloper)
app.get("/developers/:id", ensureDeveloperExists, retriveDeveloper)
app.get("/developers/:id/projects",ensureDeveloperExists, retriveProjectsDeveloper )
app.patch("/developers/:id", ensureDeveloperExists, developerDatasUnique, updateDeveloper)
app.delete("/developers/:id", ensureDeveloperExists, deleteDeveloper)

app.post("/developers/:id/infos", ensureDeveloperExists, createDeveloperInfo )
app.patch("/developers/:id/infos", ensureDeveloperExists, updateDeveloperInfo)

app.post("/projects", createProject)
app.get("/projects", readProject)
app.get("/projects/:id", ensureProjectExists, retriveProject)
app.patch("/projects/:id", ensureProjectExists, updateProject)
app.delete("/projects/:id", ensureProjectExists, deleteProject)

app.post("/projects/:id/technologies", ensureProjectExists, createTechnology)
app.delete("/projects/:id/technologies/:name", ensureProjectExists, deleteTech)

const PORT: number = 3000
const runningMsg: string = `Server running on http://localhost:${PORT}`

app.listen(PORT, async() =>{
    await startDatabase()
    console.log(runningMsg)
})