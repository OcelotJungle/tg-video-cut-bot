import { PrismaClient } from "@prisma/client";
import { injectable, singleton } from "tsyringe";

@singleton()
@injectable()
export class Prisma extends PrismaClient { }
