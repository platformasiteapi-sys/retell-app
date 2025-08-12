# Retell AI <-> jambonz Connector

This application serves as a bridge, enabling you to connect [Retell AI](https://www.retellai.com/) agents with any SIP trunking provider or PBX using the [jambonz](https://www.jambonz.org) CPaaS platform. This allows your Retell agents to make and receive phone calls over the traditional telephone network.

**Note:** This application requires jambonz version 0.9.4 or higher.

## How it Works

This Node.js application creates a websocket server that jambonz connects to.

1.  **Inbound Calls:** When your jambonz account receives an incoming call on a designated phone number, it establishes a websocket connection to this application. The application then initiates a session with your Retell AI agent and streams the audio bidirectionally between jambonz and Retell.
2.  **Outbound Calls:** When you trigger an outbound call from Retell, Retell makes a SIP call to jambonz. Jambonz, in turn, connects to this application, which then bridges the call to the destination number through your configured SIP trunk.

## Getting Started (Local Development)

You can run this application on your own infrastructure.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or later)
-   A [jambonz](https://www.jambonz.org) account (either self-hosted or on [jambonz.cloud](https://jambonz.cloud))
-   A [Retell AI](https://www.retellai.com/) account
-   A SIP trunking provider for making and receiving calls.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/jambonz/retell-app.git
    cd retell-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root of the project and add the necessary configuration. See the [Environment Variables](#environment-variables) section for details.
    ```bash
    cp .env.example .env
    # Now edit the .env file with your specific configuration
    ```

4.  **Expose your local server to the internet:**
    Your jambonz account needs to be able to reach your application. Use a tool like [ngrok](https://ngrok.com/) to expose your local server to the public internet.
    ```bash
    ngrok http 3000
    ```
    This will give you a public URL (e.g., `https://your-unique-id.ngrok.io`).

5.  **Start the application:**
    ```bash
    npm start
    ```
    Your application is now running on port 3000.

## Configuration Steps

To get the system working, you need to configure both jambonz and Retell.

### 1. Configure jambonz

Log in to your jambonz portal.

#### a. Create a Carrier for Retell

-   Go to `Carriers` and create a new carrier. Let's name it `Retell`.
-   Check the box for `E.164 syntax`.
-   Uncheck `outbound authentication`.
-   Add a single SIP outbound gateway with the network address `5t4n6j0wnrl.sip.livekit.cloud`.
-   Do not create any inbound gateways for this Carrier.

![Retell oubound gateway](images/retell-carrier.png)

#### b. Create a Carrier for your SIP Trunk

-   Create another Carrier for your actual SIP trunking provider (e.g., `My-PSTN-Provider`).
-   This Carrier should have both inbound (for receiving calls) and outbound (for making calls) gateways, configured according to your provider's instructions.

#### c. Create a SIP Client Credential

This credential is used by Retell to make outbound calls *to* jambonz.
-   Go to `Clients` and add a new SIP client with a username and password.

![Adding a sip client](images/jambonz-sip-client.png)

#### d. Create the jambonz Application

-   Go to `Applications` and create a new application.
-   For the `Webhook URL`, provide the public websocket URL of your running application (e.g., `wss://your-unique-id.ngrok.io/retell`).
-   This will reveal a set of environment variables that you can configure for the application. These correspond to the `.env` file if you are running locally, or you can set them directly in the portal.

### 2. Configure Retell

#### a. Add Your Phone Number

-   In the Retell Dashboard, go to `Phone Numbers` and click the `+` icon.
-   Select "Connect to your number via SIP trunking".
-   **Phone Number:** Add the number from your SIP provider in E.164 format (e.g., `+15551234567`).
-   **Termination URI:** Enter a URI with the SIP realm of your jambonz account (e.g., `your-account.sip.jambonz.cloud`). You can find your realm under the `Account` tab in the jambonz portal.
-   **SIP Trunk Username/Password:** Use the credentials you created in step `1c`.

![Retell Add Number](images/retell-add-number.png)

#### b. Assign the Number to an Agent

-   After creating the phone number, associate it with the Retell agent you want to handle the calls.

### 3. Link Everything Together

-   Go back to your jambonz portal.
-   Navigate to `Phone Numbers` and assign the phone number from your SIP trunking provider to the jambonz application you created in step `1d`.

## Environment Variables

These variables can be set in a `.env` file for local development or directly in the jambonz application configuration in the portal.

| Variable             | Description                                                                                                                                                                                            | Example                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| `PSTN_CARRIER`       | The name of the jambonz Carrier that connects to your SIP trunking provider.                                                                                                                           | `My-PSTN-Provider`                               |
| `RETELL_CARRIER`     | The name of the jambonz Carrier you created for Retell.                                                                                                                                                | `Retell`                                         |
| `SIP_USERNAME`       | The SIP username you created in jambonz for Retell to use.                                                                                                                                             | `retell-outbound`                                |
| `SIP_PASSWORD`       | The password for the SIP user.                                                                                                                                                                         | `strong-password`                                |
| `COUNTRY_CODE`       | (Optional) If your provider delivers numbers in a national format (without a country code), provide your country code here. It will be prepended before sending the call to Retell.                    | `1`                                              |
| `OVERRIDE_CALLER_ID` | (Optional) A specific caller ID to use for outbound calls from Retell. This is rarely needed but some providers (like SIPgate) may require a specific identifier in the `From` header.                 | `anonymous`                                      |
| `CALLER_ID_CAROUSEL` | (Optional) A comma-separated list of E.164 phone numbers to use as caller IDs for outbound calls from Retell. The application will rotate through this list for each call.                               | `+15551112222,+15553334444`                      |
| `LOGLEVEL`           | (Optional) The log level for the application.                                                                                                                                                          | `info`                                           |
| `HTTP_PORT`          | (Optional) The port for the application to listen on.                                                                                                                                                  | `3000`                                           |
