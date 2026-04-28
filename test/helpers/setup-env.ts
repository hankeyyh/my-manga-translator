/**
 * Jest 启动时加载 .env.local，仅本地存在该文件时生效。
 * .env.local 不提交，CI 通过 workflow 设置环境变量。
 */
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), quiet: true })
