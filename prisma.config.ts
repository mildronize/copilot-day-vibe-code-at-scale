import path from "node:path";

export default {
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url:
      process.env["DATABASE_URL"] ??
      "postgresql://postgres:postgres@localhost:5432/todo_app?schema=public",
  },
};
