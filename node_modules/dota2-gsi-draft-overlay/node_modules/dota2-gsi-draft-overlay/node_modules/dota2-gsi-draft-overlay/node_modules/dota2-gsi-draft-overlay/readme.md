# Dota 2 GSI Draft Overlay

This project provides a draft overlay for Dota 2 using Game State Integration (GSI). It displays the draft picks, bans, and player information in real-time.

## Project Structure

- `dota2-gsi-server`: Backend server to receive and serve game state data.
- `overlay-ui`: Frontend React application to display the draft overlay.

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/Mulloo/dota2-gsi-draft-overlay.git
   cd dota2-gsi-draft-overlay
   ```

2. Install dependencies for the backend server:

   ```sh
   cd dota2-gsi-server
   npm install
   cd ..
   ```

3. Install dependencies for the frontend:

   ```sh
   cd overlay-ui
   npm install
   cd ..
   ```

### Running the Application

1. Start the backend server:

   ```sh
   npm run start-server
   ```

2. Start the frontend application:

   ```sh
   npm run start-client
   ```

Alternatively, you can use the provided batch script to launch both servers:

```sh
./launch_servers.bat
```

### Usage

- The backend server listens on port `4000` and receives game state data from Dota 2.
- The frontend application runs on port `3000` and displays the draft overlay.

### Configuration

Ensure that Dota 2 is configured to send game state data to the backend server. Add the following configuration to your `gamestate_integration_yourcfg.cfg` file in the Dota 2 `cfg` directory:

```json
"Your Configuration"
{
    "uri" "http://localhost:4000/"
    "timeout" "5.0"
    "buffer"  "0.1"
    "throttle" "0.1"
    "heartbeat" "30.0"
    "data"
    {
        "provider"            "1"
        "map"                 "1"
        "player"              "1"
        "hero"                "1"
        "abilities"           "1"
        "items"               "1"
        "draft"               "1"
        "wearables"           "1"
    }
}
```

### Development

#### Backend

The backend server is a simple Express application that receives game state data via POST requests and serves it via GET requests.

#### Frontend

The frontend is a React application that fetches game state data from the backend server and displays it using various components.

### File Structure

- `dota2-gsi-server`
  - `server.js`: Main server file.
  - `package.json`: Dependencies and scripts for the backend server.

- `overlay-ui`
  - `src`
    - `App.js`: Main application component.
    - `DraftOverlay.jsx`: Component to display the draft overlay.
    - `index.js`: Entry point for the React application.
    - `index.css`: Global styles.
    - `DraftOverlay.css`: Styles specific to the draft overlay.
  - `public`
    - `index.html`: HTML template for the React application.
  - `package.json`: Dependencies and scripts for the frontend application.
  - `tailwind.config.js`: Configuration for Tailwind CSS.
  - `postcss.config.js`: Configuration for PostCSS.

### License

This project is licensed under the ISC License.

### Acknowledgements

- [Create React App](https://github.com/facebook/create-react-app)
- [Express](https://expressjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
