CREATE  DATABASE projectsDeveloper;

CREATE  TYPE "OS" AS ENUM ('Windows', 'Linux', 'MacOS');

CREATE  TABLE IF NOT EXISTS developer_infos(
	"developerInfoId" BIGSERIAL PRIMARY KEY,
	"developerInfoDeveloperSince" DATE NOT NULL,
	"developerInfoPreferredOS" "OS" NOT NULL 
);

CREATE TABLE IF NOT EXISTS developers (
	"developerID" BIGSERIAL PRIMARY KEY,
	"developerName" VARCHAR(50) NOT NULL,
	"developerEmail" VARCHAR(50) NOT NULL,
	"developerInfoId" INTEGER UNIQUE,
	FOREIGN KEY ("developerInfoId") REFERENCES developer_infos("developerInfoId") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS projects(
	"projectID" BIGSERIAL PRIMARY KEY,
	"projectName" VARCHAR(50) NOT NULL,
	"projectDescription" TEXT NOT NULL,
	"projectEstimatedTime" VARCHAR(20) NOT NULL,
	"projectRepository" VARCHAR(120) NOT NULL,
	"projectStartDate" DATE NOT NULL,
	"projectEndDate" DATE,
	"developerId" INTEGER NOT NULL,
	FOREIGN KEY ("developerId") REFERENCES developers("developerID") 
);

CREATE TABLE IF NOT EXISTS technologies(
	"technologyId" BIGSERIAL PRIMARY KEY,
	"technologyName" VARCHAR(30) NOT NULL
);

INSERT INTO technologies ("technologyName")
	VALUES('JavaScript'), ('Python'),
		  ('React'), ('Express.js'), 
		  ('HTML'), ('CSS'),('Django'), 
		  ('PostgreSQL'), ('MongoDB');
		 

CREATE TABLE IF NOT EXISTS projects_technologies(
	"id" BIGSERIAL PRIMARY KEY,
	"addedIn" DATE NOT NULL,
	"projectId" INTEGER NOT NULL,
	"technologyId" INTEGER NOT NULL,
	FOREIGN KEY ("projectId") REFERENCES projects("projectID"),
	FOREIGN KEY ("technologyId") REFERENCES technologies("technologyId")
);

SELECT *
FROM  projects_technologies;


SELECT 
	*
FROM 
	projects_technologies pt
FULL JOIN projects pr ON pt."projectId" = pr."projectID"
FULL JOIN technologies te ON pt."technologyId" = te."technologyId"
WHERE pr."projectID" = 26;

SELECT 
	te."technologyId",
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
FULL JOIN technologies te ON pt."technologyId" = te."technologyId";

SELECT 
	  t.*,
      de.*,
      di.*,
      pr."projectID",
      pr."projectName",
      pr."projectDescription",
      pr."projectEstimatedTime",
      pr."projectRepository",
      pr."projectStartDate",
      pr."projectEndDate",
      pt."technologyId"
    FROM  
      developers de
  FULL JOIN 
      developer_infos di ON de."developerInfoId" = di."developerInfoId"
  FULL JOIN 
      projects pr ON pr."developerId" = di."developerInfoId"
  FULL JOIN 
      projects_technologies pt ON pt."projectId" = pr."projectID"
FULL JOIN 
     	technologies t ON pt."technologyId" = t."technologyId" 
  WHERE 
      de."developerID" =1;
