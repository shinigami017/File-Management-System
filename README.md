# File-Management-System


This is a web application for universities and their faculties to manage their learning system. This application helps them to create a network of their students and faculties, where all necessary info related to them, is available. Moreover, this application provides both Student portal and Faculty portal, with their respective functionalities. Faculties can upload the problem statements for assignments, lab practicals, reports, etc. and each of the target students recieve the updates and are allowed to upload their work for submission and evaluation. This application could really made the workflow in universities more simple and advanced.

## Usage

For simple demo of the application i have made a fake setup with some demo faculties, students, batches, etc.

So, for testing purposes you can visit the site and login with the following user details : 

1. Teacher role 1
    ```sh
    "username": "FMSF000001",
    "password": "123456"
    ```

2. Teacher role 2
    ```sh
    "username": "FMSF000002",
    "password": "123456"
    ```

3. Student role 1
    ```sh
    "username": "FMSS000001",
    "password": "123456"
    ```

4. Student role 2
    ```sh
    "username": "FMSS000002",
    "password": "123456"
    ```

5. Student role 3
    ```sh
    "username": "FMSS000003",
    "password": "123456"
    ```

## Info for developers

0. Your system must have node environment already setup. If not, then install ***Node.js*** environment first [install](https://nodejs.org/en/download/).

1. After node setup on your system clone or downlaod this repository locally in your system.

2. Open the local repository in your terminal

3. Install dependencies
```sh
   npm install
```

4. Launch the server 
```sh
   npm run start
``` 

5. Open your browser and browse to ```http://localhost:3000``` (You are good to go!)

## API 

1. Create/Add new batches to database (POST)
```sh
  Add sections for a course
> http://localhost:3000/addsections 
  Request body
 { 
    "course": "(MS555) My Subject"
 }

 Add courses 
> http://localhost:3000/addcourse 
  Request body
 { 
    "name": "My Subject",
    "code": "MS555"
 }
```
2. Register User (POST)
```sh
> http://localhost:3000/fms.edu.in/users/register 
  Request body
 { 
    "username": "1000005555",
    "firstname": "Satyam",
    "lastname": "Bhatia",
    "email": "mymail@gmail.com",
    "phone": "8659741236",
    "role": "student",
    "password": "123456",
    "password2": "123456"
 }
```
3. Login User (POST)
```sh
> http://localhost:3000/fms.edu.in/users/login
  Request body 
  { 
    "username":"1000005555",
    "password":"123456"
  }
```
4. Add batches to the user (POST)
```sh
> http://localhost:3000/fms.edu.in/users/addbatch
  Request body 
  { 
    "code":"MS555",
    "section":"A"
  }
```