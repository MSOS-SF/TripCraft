CREATE TABLE `trips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`destination` varchar(255) NOT NULL,
	`days` int NOT NULL,
	`budget` varchar(32) NOT NULL,
	`tripGroup` varchar(32) NOT NULL,
	`travelers` int DEFAULT 1,
	`interests` json NOT NULL,
	`adultOnly` int NOT NULL DEFAULT 0,
	`itinerary` json NOT NULL,
	`selectedOption` varchar(16) DEFAULT 'A',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trips_id` PRIMARY KEY(`id`)
);
