# Auro ORM 🚀

Auro ORM is a TypeScript library with a powerful Rust engine under the hood. It provides an efficient Object-Relational Mapping (ORM) solution for your TypeScript projects. Auro ORM's design is inspired by the simplicity of Prisma-like syntax, making it easy to interact with your database and build exceptional applications. Auro ORM is not yet production ready and in that case take care about usage.

## Features 🌟

- 🚀 **Efficient Queries**: Auro ORM utilizes a high-performance Rust engine for optimal database queries.
- 🔄 **TypeScript Support**: Enjoy the benefits of strong typing and TypeScript autocompletion.
- 📦 **Prisma-like Syntax**: Write elegant and readable queries with syntax similar to Prisma.
- 💪 **Rust-Powered**: Harness the power and safety of Rust under the hood.

## Installation 📦

To start using Auro ORM in your TypeScript project, install it via npm or yarn:

```bash
npm install @auro-orm/client
# or
yarn add @auro-orm/client
```

After installing Auro ORM create dotenv file with:

```dosini
RESOURCE_ARN=
SECRET_ARN=
DATABASE=
REGION=
SCHEMA=
# If your schema has - in name you should add env variable like this SCHEMA='"my-schema"'
```

After creating dotenv file run command to generate Auro Client:
```bash
npx auro generate
```

## Usage
Now you can start writing queries and using Auro ORM to interact with your database. Check the Auro ORM Documentation for detailed usage examples and API reference.

## Contribution 👥
Contributions are welcome! If you encounter issues or have ideas for improvements, please open an issue or submit a pull request on our GitHub repository.

## License 📜
Auro ORM is licensed under the Apache 2.0 License. See the LICENSE file for details.
