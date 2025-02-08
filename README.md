# VReqST

**VReqST - Requirement Specification Tool Support for Virtual Reality Products**

Virtual Reality (VR) Environments are challenging to build with discrete and incremental requirements. VR practitioners often need human assistance to achieve product completeness, as most VR requirements are either abstract or under specified. The slightest change to these requirement specifications tends to drastically impact the overall control-flow of the product. It exponentially increases the development cost. To address the completeness of specifying VR product requirements, we introduce VReqST, a tool for specifying requirements for VR software products. We use role base model template of bare-minimum VR Software to auto-provision all dimensions of VR as a domain on specifying VR product requirements. This tool avoids ambiguity while specifying requirements and provides seamless VR product development.

This repo contains sample requirement specifications of two real-time VR projects for VR practitioners reference.

_Video DEMO_: https://zenodo.org/record/7647338#.Y-9O-nZBztA 

### Steps to execute

- Make sure you have Node.js v14 installed, some packaged might not be compatible with other versions.

```sh

-|> Open Terminal and run
     $ nvm use 14
-|> Go inside the VReqST-main folder
-|> Now again go inside the VReqST folder
-|> To start the app on Port 3000, Go inside the frontend folder
-|> Open Terminal And Run
     $ npm install
     $ npm run client-install
     $ npm run dev
-|> Now to start the backend_server on Port 5002. Again, Go Inside the backend folder
-|> Open the terminal and Run
     $ npm install
     $ nodemon server.js
-|> Now to start the validation_server on Port 5001. Again,Go Inside the validation_server folder
-|> Open the terminal and Run
     $ npm install
     $ nodemon index.js
```

to start the local server at http://localhost:3000/ and Validation_server at http://localhost:5001
