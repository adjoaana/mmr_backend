const request = require('supertest');
const app = require('../../app'); // Update the path based on your project structure
const db = require('../db');
const env = require('../../config');

const agent = request.agent(app);

const AdminService = require('../../services/Admin.service');
const AuthenticationManager = require('../../utils/Authentication.manager');
const TemplateService = require('../../services/Template.service');
const ExerciseService = require('../../services/Exercise.service'); // Assuming you have Exercise service
const BodyPartService = require('../../services/BodyPart.service');
const UserService = require('../../services/User.service')
const HealthProfessionalTypeService = require('../../services/HealthProfessionalType.service');


const healthProfessionalTypeService = new HealthProfessionalTypeService();
const adminService = new AdminService();
const userService = new UserService();;
const templateService = new TemplateService();
const exerciseService = new ExerciseService();
const bodyPartService = new BodyPartService();



let admin = null;
let admin_token = null;
let healthProfessionalType = null;
let patient = null;
let patient_token = null;
let healthProfessional = null;
let healthProfessional_token = null;


beforeAll(async () => {
  await db.connect();
  
});

afterAll(async () => {
  const response = await db.close();
  return response;
});

beforeEach(async () => {
  await db.clear();

  const new_admin = { email: 'admin@email.com',photo: { key: "photo-key" }, name: 'Tester Admin', password: 'my_pass' };
  const new_patient = { email: "test@email.com", name: "tester one", photo: { key: "photo-key" }, password: "my_pass", role: env.PATIENT_ROLE };
	const new_healthProfessional = { email: "test1@email.com", name: "tester one", photo: { key: "photo-key" }, password: "my_pass", role: env.HEALTH_PROFESSIONAL_ROLE };
	const new_healthProfessionalType = { name: "physio" }
 
  
  healthProfessionalType = await healthProfessionalTypeService.create(new_healthProfessionalType);
	patient = await userService.create(new_patient);
	admin = await adminService.create(new_admin);
	healthProfessional = await userService.create(new_healthProfessional);

  const patient_body = {
		email: patient.email,
		_id: patient._id,
		role: env.PATIENT_ROLE,
		creator: patient.creator,
	}

	const admin_body = {
		email: admin.email,
		_id: admin._id,
		role: env.ADMIN_ROLE,
	}
	const healthProfessional_body = {
		email: healthProfessional.email,
		_id: healthProfessional._id,
		role: env.HEALTH_PROFESSIONAL_ROLE,
	}

  admin_token = AuthenticationManager.createToken(admin_body);
	patient_token = AuthenticationManager.createToken(patient_body);
	healthProfessional_token = AuthenticationManager.createToken(healthProfessional_body);
  console.log("Admin" , admin_token)
  console.log("Patient token", patient_token);
  console.log("HP TOKEN", healthProfessional_token)
});
describe('ExerciseTemplates Endpoints /api/templates/users/', () =>{

})

describe('ExerciseTemplate Endpoints /api/templates/', () => {
  test('POST', async () => {
    // Prepare data for the test
    const tempBodyPart = { name: 'part1', description: 'desc' };
    const bodyPart = await bodyPartService.create(tempBodyPart);

    // console.log("bodypaert",bodyPart)

    const newExercise = {
      title: 'Test Exercise',
      description: 'This is the test description',
      bodyPart: bodyPart._id,
      creator: {
				userRole: env.ADMIN_ROLE,
				admin: admin._id
			},
			lastEditor: {
				userRole: env.ADMIN_ROLE,
				admin: admin._id
			},
			video: {
				url: "/video.mp4",
				key: "test-video",
			},
			audio: {
				url: "/audio.mp3",
				key: "test-audio",
			},
			thumbImage: {
				url: "/video.jpg",
				key: "test-thumbImage",
			},
			image: {
				url: "/image.jpg",
				key: "test-image",
			}
    };

    const exercise = await exerciseService.create(newExercise);
    // console.log("newExercise",newExercise)

    const newTemplate = {
      title: 'Test Template',
      description: 'This is the test template description',
      timestamp: new Date().getTime(),
      patient: patient._id,
			healthProfessional: healthProfessional._id,
			healthProfessionalType: healthProfessionalType._id,
      warmup: [
        {
          exercise: exercise._id.toString(),
          sets: 3,
          reps: 10,
          time: 30,
          intensity: 'low',
        },
      ],
      main: [
        {
          exercise: exercise._id.toString(),
          sets: 2,
          reps: 8,
          time: 20,
          intensity: 'high',
        },
      ],
      cooldown: [
        {
          exercise: exercise._id.toString(),
          sets: 2,
          reps: 8,
          time: 20,
          intensity: 'high',
        },
      ],
      creator: {
        userRole: env.ADMIN_ROLE,
        admin: admin._id,
      },
      lastEditor: {
        userRole: env.ADMIN_ROLE,
        admin: admin._id,
      },
    };
    const template = await templateService.create(newTemplate)
    // console.log("This is the created template",template)
    // Perform the API request
    return agent
      .post('/api/templates/text')
      .send(newTemplate)
      .set('Auth-Token', admin_token)
      .expect(404)
      .then((res) => {
        // console.log(res.body)
        expect(res.body.body.title).toMatch(newTemplate.title);
        expect(res.body.body.description).toMatch(newTemplate.description);
        expect(res.body.body.warmup).toEqual(newTemplate.warmup)
        expect(res.body.body.cooldown).toEqual(newTemplate.cooldown)
        expect(res.body.body.main).toEqual(newTemplate.main)
        // Add more assertions based on your model structure
       
      });
      
  });
  // test('GET /:id', async () => {
  //   // Assuming you have a function to create an ExerciseTemplate
  //   const tempBodyPart = { name: 'part1', description: 'desc' };
  //   const bodyPart = await bodyPartService.create(tempBodyPart);
  //   // console.log(bodyPart)
  //   const new_exercise = {
	// 		title: "Test Exercise",
	// 		description: "This is the test description",
	// 		bodyPart: bodyPart._id,
	// 		creator: {
	// 			userRole: env.ADMIN_ROLE,
	// 			admin: admin._id
	// 		},
	// 		lastEditor: {
	// 			userRole: env.ADMIN_ROLE,
	// 			admin: admin._id
	// 		},
	// 		video: {
	// 			url: "/video.mp4",
	// 			key: "test-video",
	// 		},
	// 		audio: {
	// 			url: "/audio.mp3",
	// 			key: "test-audio",
	// 		},
	// 		thumbImage: {
	// 			url: "/video.jpg",
	// 			key: "test-thumbImage",
	// 		},
	// 		image: {
	// 			url: "/image.jpg",
	// 			key: "test-image",
	// 		}
	// 	}

  //   const exercise = await exerciseService.create(new_exercise)
  //   console.log("exercise", exercise)
  //   const template = await exerciseTemplateService.create({
  //     title: 'Test Template',
  //     description: 'This is the test template description',
  //     warmup: [
  //       {
  //         exercise: exercise._id.toString(),
  //         sets: 3,
  //         reps: 10,
  //         time: 30,
  //         intensity: 'low',
  //       },
  //     ],
  //     main: [
  //       {
  //         exercise: exercise._id.toString(),
  //         sets: 2,
  //         reps: 8,
  //         time: 20,
  //         intensity: 'high',
  //       },
  //     ],
  //     cooldown: [
  //       {
  //         exercise:exercise._id.toString(), 
  //         sets: 2,
  //         reps: 8,
  //         time: 20,
  //         intensity: 'high',
  //       },
  //     ],
  //     creator: { userRole: env.ADMIN_ROLE, admin: admin._id },
  //     lastEditor: { userRole: env.ADMIN_ROLE, admin: admin._id },
  //   });
  //   console.log(template)

  //   return agent
  //     .get(`/api/templates/${template._id}`)
  //     .set('Auth-Token', admin_token)
  //     .expect(200)
  //     .then((res) => {
  //       console.log(res.body)
  //       expect(res.body.body.title).toEqual(template.title);
  //       expect(res.body.body.description).toEqual(template.description);
  //       expect(res.body.body.warmup.exercise).toEqual(template.warmup.exercise);
  //       expect(res.body.body.cooldown.exercise).toEqual(template.cooldown.exercise);
  //       expect(res.body.body.main.exercise).toEqual(template.main.exercise);
  //       // Add more assertions based on your model structure
  //     });
  // });
  // test('GET /:id', async () => {
  //   const tempBodyPart = { name: 'part1', description: 'desc' };
  //   const bodyPart = await bodyPartService.create(tempBodyPart);
  
  //   const expectedExerciseCount = 3; // Adjust as needed
  //   const exercises = [];
  
  //   for (let i = 0; i < expectedExerciseCount; i++) {
  //     const newExercise = {
  //       title: `Test Exercise ${i}`,
  //       description: `Description ${i}`,
  //       bodyPart: bodyPart._id,
  //       creator: {
  //         userRole: env.ADMIN_ROLE,
  //         admin: admin._id
  //       },
  //       lastEditor: {
  //         userRole: env.ADMIN_ROLE,
  //         admin: admin._id
  //       },
  //       video: {
  //         url: "/video.mp4",
  //         key: "test-video",
  //       },
  //       audio: {
  //         url: "/audio.mp3",
  //         key: "test-audio",
  //       },
  //       thumbImage: {
  //         url: "/video.jpg",
  //         key: "test-thumbImage",
  //       },
  //       image: {
  //         url: "/image.jpg",
  //         key: "test-image",
  //       }
  //       // ... other exercise properties
  //     };
  
  //     const exercise = await exerciseService.create(newExercise);
  //     exercises.push(exercise);
  //   }
  
  //   const template = await exerciseTemplateService.create({
  //     title: 'Test Template',
  //     description: 'This is the test template description',
  //     warmup: exercises.map((e) => ({
  //       exercise: e._id.toString(),
  //       sets: 3,
  //       reps: 10,
  //       time: 30,
  //       intensity: 'low',
  //     })),
  //     main: exercises.map((e) => ({
  //       exercise: e,
  //       sets: 2,
  //       reps: 8,
  //       time: 20,
  //       intensity: 'high',
  //     })),
  //     cooldown: exercises.map((e) => ({
  //       exercise: e,
  //       sets: 2,
  //       reps: 8,
  //       time: 20,
  //       intensity: 'high',
  //     })),
  //     creator: { userRole: env.ADMIN_ROLE, admin: admin._id },
  //     lastEditor: { userRole: env.ADMIN_ROLE, admin: admin._id },
  //   });
  
  //   return agent
  //     .get(`/api/templates/${template._id}`)
  //     .set('Auth-Token', admin_token)
  //     .expect(200)
  //     .then((res) => {
  //       const responseBody = res.body.body;
  
  //       expect(responseBody.title).toEqual(template.title);
  //       expect(responseBody.description).toEqual(template.description);
  
  //       // Loop through warmup exercises and perform assertions
  //       for (let i = 0; i < expectedExerciseCount; i++) {
  //         const expectedWarmupExercise = template.warmup[i];
  //         const actualWarmupExercise = responseBody.warmup[i];
  //         expect(actualWarmupExercise.exercise).toMatch(expectedWarmupExercise.exercise);
  //         expect(actualWarmupExercise.sets).toEqual(expectedWarmupExercise.sets);
  //         expect(actualWarmupExercise.reps).toEqual(expectedWarmupExercise.reps);
  //         expect(actualWarmupExercise.time).toEqual(expectedWarmupExercise.time);
  //         expect(actualWarmupExercise.intensity).toEqual(expectedWarmupExercise.intensity);
  //         // Add more assertions based on your model structure
  //       }

  //       //Loop through main exercises and perform assertions
  //       for (let i = 1; i < expectedExerciseCount; i++) {
  //         const expectedmainExercise = template.main[i];
  //         const actualmainExercise = responseBody.main[i];
  //         expect(actualmainExercise.exercise).toEqual(expectedmainExercise.exercise);
  //         expect(actualmainExercise.sets).toEqual(expectedmainExercise.sets);
  //         expect(actualmainExercise.reps).toEqual(expectedmainExercise.reps);
  //         expect(actualmainExercise.time).toEqual(expectedmainExercise.time);
  //         expect(actualmainExercise.intensity).toEqual(expectedmainExercise.intensity);
  //         // Add more assertions based on your model structure
  //       }

  //       //Loop through cooldown exercises and perform assertions
  //       for (let i = 0; i < expectedExerciseCount; i++) {
  //         const expectedcooldownExercise = template.cooldown[i];
  //         const actualcooldownExercise = responseBody.cooldown[i];
  //         expect(actualcooldownExercise.exercise).toEqual(expectedcooldownExercise.exercise);
  //         expect(actualcooldownExercise.sets).toEqual(expectedcooldownExercise.sets);
  //         expect(actualcooldownExercise.reps).toEqual(expectedcooldownExercise.reps);
  //         expect(actualcooldownExercise.time).toEqual(expectedcooldownExercise.time);
  //         expect(actualcooldownExercise.intensity).toEqual(expectedcooldownExercise.intensity);
  //         // Add more assertions based on your model structure
  //       }
  
  //       // Perform similar assertions for main and cooldown exercises
  //     });
  // });
  

  // test('GET /api/templates/', async () => {
  //   const temp = {
	// 		name: "part1",
	// 		description: "desc"
	// 	}

	// 	const part = await bodyPartService.create(temp);

	// 	const new_exercise = {
	// 		title: "Test Exercise",
	// 		description: "This is the test description",
	// 		bodyPart: part._id,
	// 		creator: {
	// 			userRole: env.ADMIN_ROLE,
	// 			admin: admin._id
	// 		},
	// 		lastEditor: {
	// 			userRole: env.ADMIN_ROLE,
	// 			admin: admin._id
	// 		},
	// 		video: {
	// 			url: "/video.mp4",
	// 			key: "test-video",
	// 		},
	// 		audio: {
	// 			url: "/audio.mp3",
	// 			key: "test-audio",
	// 		},
	// 		thumbImage: {
	// 			url: "/video.jpg",
	// 			key: "test-thumbImage",
	// 		},
	// 		image: {
	// 			url: "/image.jpg",
	// 			key: "test-image",
	// 		}
	// 	}
  //   //to create multiple exercises
  //   const expectedCount = 15;
	// 	const exercises = [];

	// 	for (let i = 0; i < expectedCount; i++) {
	// 		new_exercise.title = new_exercise.title + i;
	// 		new_exercise.description = new_exercise.description + i;
	// 		new_exercise.video.key = new_exercise.video.key + i;
	// 		new_exercise.image.key = new_exercise.image.key + i;
	// 		new_exercise.audio.key = new_exercise.audio.key + i;
	// 		new_exercise.thumbImage.key = new_exercise.thumbImage.key + i;

	// 		const exercise = await exerciseService.create(new_exercise);
	// 		exercises.push(exercise);
	// 	}

  //   // Assuming you have a function to create multiple ExerciseTemplates
  //   const templates = await Promise.all([
  //     exerciseTemplateService.create(/* template data */),
  //     exerciseTemplateService.create(/* template data */),
  //     // Add more template creations as needed
  //   ]);

  //   return agent
  //     .get('/api/templates/')
  //     .set('Auth-Token', admin_token)
  //     .expect(200)
  //     .then((res) => {
  //       expect(res.body.length).toBe(templates.length);
  //       // Add assertions comparing the returned templates with the expected ones
  //     });
  // });

  // test('PUT /api/templates/:id', async () => {
  //   // Assuming you have a function to create an ExerciseTemplate
  //   const template = await exerciseTemplateService.create({
  //     templateName: 'Test Template',
  //     description: 'This is the test template description',
  //     warmup: [],
  //     main: [],
  //     cooldown: [],
  //     creator: { userRole: env.ADMIN_ROLE, admin: admin._id },
  //     lastEditor: { userRole: env.ADMIN_ROLE, admin: admin._id },
  //   });

  //   const updatedData = {
  //     templateName: 'Updated Template Name',
  //     // Add other fields to update
  //   };

  //   return agent
  //     .put(`/api/templates/${template._id}`)
  //     .send(updatedData)
  //     .set('Auth-Token', admin_token)
  //     .expect(200)
  //     .then((res) => {
  //       expect(res.body.templateName).toEqual(updatedData.templateName);
  //       // Add more assertions based on your model structure
  //     });
  // });

  // test('DELETE /api/templates/:id', async () => {
  //   // Assuming you have a function to create an ExerciseTemplate
  //   const template = await exerciseTemplateService.create({
  //     templateName: 'Test Template',
  //     description: 'This is the test template description',
  //     warmup: [],
  //     main: [],
  //     cooldown: [],
  //     creator: { userRole: env.ADMIN_ROLE, admin: admin._id },
  //     lastEditor: { userRole: env.ADMIN_ROLE, admin: admin._id },
  //   });

  //   return agent
  //     .delete(`/api/templates/${template._id}`)
  //     .set('Auth-Token', admin_token)
  //     .expect(200)
  //     .then(async (res) => {
  //       const deletedCount = 1;
  //       expect(res.body.deleted).toBe(deletedCount);
  //       const deletedTemplate = await exerciseTemplateService.getById(template._id);
  //       expect(deletedTemplate).toBeNull();
  //     });
  // });


  // Add more test cases for other endpoints (GET, PUT, DELETE) and edge cases as needed
});






