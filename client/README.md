# FarmTrack

FarmTrack is a web system for managing chicken farms.

It helps farm owners and staff keep farm information in one place. Instead of using paper books or many spreadsheets, the team can record daily work and see important farm information more clearly.

## Who is FarmTrack for?

FarmTrack is made for:

- Poultry farm owners
- Farm managers
- Farm workers
- Small and large chicken farms

The system uses different user roles. Administrators can manage users, while managers and workers can use the farm management features allowed for their roles.

## Core features

- User registration and login
- Secure JWT authentication
- Admin, manager, and worker roles
- Farm and flock management
- Bird population and mortality records
- Feed and inventory tracking
- Stock movement records
- Egg production records
- Health and vaccination records
- Sales and expense records
- Finance and profit information
- Dashboard summaries and analytics
- English and Sinhala language support

## Technology used

- React and Vite for the frontend
- Node.js and Express for the backend API
- MongoDB for the database
- Mongoose for database access
- JWT for login security

## Requirements

Install these before starting:

- Git
- Node.js 18 or newer
- npm
- MongoDB or a MongoDB Atlas account

Check your installed versions:

```bash
node --version
npm --version
git --version
```

## Run FarmTrack locally

### 1. Clone the project

Open a terminal and run:

```bash
git clone https://github.com/Adeesha-Sandaruwan/FarmTrack.git
cd FarmTrack
```

### 2. Install server packages

From the project root, run:

```bash
cd server
npm install
```

### 3. Create the server environment file

Inside the `server` folder, create a file named `.env`.

Add these values. Replace the example values with your own values:

```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/farmtrack
JWT_SECRET=replace-this-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

ADMIN_NAME=FarmTrack Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeThisPassword123!
```

Important:

- Do not share your `.env` file.
- Do not commit passwords, database URLs, or JWT secrets to Git.
- Make sure your MongoDB user can access the database.

### 4. Create the first administrator

Keep your terminal inside the `server` folder and run:

```bash
npm run seed:admin
```

This creates the administrator using the values in `.env`.

### 5. Install client packages

Open a second terminal. From the project root, run:

```bash
cd FarmTrack/client
npm install
```

The client uses this default API address:

```text
http://localhost:5000/api
```

If your server uses a different address, create `client/.env` and add:

```env
VITE_API_URL=http://localhost:5000/api
```

### 6. Start the backend server

In the first terminal:

```bash
cd FarmTrack/server
npm run dev
```

The backend will run at `http://localhost:5000`.

### 7. Start the frontend

In the second terminal:

```bash
cd FarmTrack/client
npm run dev
```

Open the address shown by Vite. It is normally `http://localhost:5173`.

You can now register a user or log in with the administrator account created in step 4.

## Useful commands

### Client commands

```bash
npm run dev        # Start the frontend
npm run build      # Build the frontend for production
npm run lint       # Check the frontend code
npm run preview    # Preview the production build
```

### Server commands

```bash
npm run dev        # Start the server in development mode
npm start          # Start the server normally
npm run seed:admin # Create the administrator account
```

## Project folders

```text
FarmTrack/
|-- client/       React frontend
|-- server/       Express backend API
|-- docs/         API and Postman documentation
|-- README.md     Project information
```

## API documentation

The `docs` folder contains Postman files for testing the authentication API:

- `FarmTrack-Auth.postman_collection.json`
- `FarmTrack-Local.postman_environment.json`

Import these files into Postman after starting the server.

## Common problems

### MongoDB connection failed

Check that `MONGODB_URI` is in `server/.env`, your MongoDB username and password are correct, your IP address is allowed in MongoDB Atlas, and the database server is running.

### The client cannot connect to the server

Check that the backend is running on port `5000`, the client is using `http://localhost:5000/api`, and `CLIENT_URL` is `http://localhost:5173`.

### Port already in use

Stop the other application using the port, or change `PORT` in `server/.env`. If you change the backend port, also update `VITE_API_URL` in `client/.env`.

## License

This project is for FarmTrack development and educational use.
