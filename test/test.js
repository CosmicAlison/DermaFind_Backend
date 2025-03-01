const chai = import('chai');
const chaiHttp = require('chai-http');
const fs = require('fs');
const app = require('../index.js');
const request = require('request')
const expect = chai.expect;
//chai.use(chaiHttp);

describe('API Endpoints', () => {

    // Test GET /discussions endpoint
    describe('GET /discussions', () => {
        it('should return an array of discussions', (done) => {
                request(app)
                .get('/discussions')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    done();
                });
        });
    });

    // Test GET /user endpoint
    describe('GET /user', () => {
        it('should return user data for a valid email', (done) => {
            const userEmail = 'test@example.com'; // Provide a valid email for testing
                request(app)
                .get(`/user?email=${userEmail}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('_id');
                    expect(res.body).to.have.property('name');
                    // Add more assertions as needed
                    done();
                });
        });

        it('should return 400 if email parameter is missing', (done) => {
                request(app)
                .get('/user')
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    done();
                });
        });

        it('should return 404 for non-existent user', (done) => {
            const userEmail = 'nonexistent@example.com'; // Provide a non-existent email for testing
                request(app)
                .get(`/user?email=${userEmail}`)
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    done();
                });
        });
    });

    // Test POST /users endpoint
    describe('POST /users', () => {
        it('should create a new user', (done) => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
            };
                request(app)
                .post('/users')
                .send(userData)
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('message').eql('User created successfully');
                    expect(res.body).to.have.property('user');
                    expect(res.body.user).to.have.property('_id');
                    done();
                });
        });
    });


});
