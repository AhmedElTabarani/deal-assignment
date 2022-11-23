require('./user.test');
const chai = require('chai');
const chaiHTTP = require('chai-http');
const Post = require('../models/post.model');
let server = require('../server');

chai.use(chaiHTTP);

const should = chai.should();

describe('> Post Operation', () => {
  let admin; // to use it to test operations that restrictTo ADMIN ONLY
  let user; // to use it to test operations that restrictTo USER ONLY
  let post;

  before(async () => {
    server = await server;
    await Post.deleteMany({});
  });

  describe('> Login user and admin to test operation that restrict to them', async () => {
    describe('> Login as a user', () => {
      it('should success to login a user', (done) => {
        const testUser = {
          email: 'user@deal.com',
          password: '123456',
        };
        chai
          .request(server)
          .post('/api/users/login')
          .send(testUser)
          .end((err, res) => {
            const body = res.body;

            // get data of normal user
            user = body.data;
            user.token = body.token;

            res.should.have.status(200);
            body.should.have.all.keys(['status', 'data', 'token']);
            body.status.should.be.a('string').eql('success');
            body.data.should.include.all.keys([
              '_id',
              'name',
              'email',
              'role',
            ]);
            body.data.name.should.be.a('string').eql('user');
            body.data.email.should.be.a('string').eql(testUser.email);
            body.data.role.should.be.a('string').eql('USER');
            body.token.should.be.a('string');
            done();
          });
      });
    });
    describe('> Login as an admin', () => {
      it('should success to login as an admin', (done) => {
        const testUser = {
          email: 'admin@deal.com',
          password: 'deal123',
        };
        chai
          .request(server)
          .post('/api/users/login')
          .send(testUser)
          .end((err, res) => {
            const body = res.body;

            // get admin data & token
            admin = body.data;
            admin.token = body.token;

            res.should.have.status(200);
            body.should.have.all.keys(['status', 'data', 'token']);
            body.status.should.be.a('string').eql('success');
            body.data.should.include.all.keys([
              '_id',
              'name',
              'email',
              'role',
            ]);
            body.data.name.should.be.a('string').eql('admin');
            body.data.email.should.be.a('string').eql(testUser.email);
            body.data.role.should.be.a('string').eql('ADMIN');
            body.token.should.be.a('string');
            done();
          });
      });
    });
  });
  describe('> Create a post', () => {
    it('should normal user can create a post', (done) => {
      const testPost = {
        title: 'aaa',
        body: 'bbb',
      };
      chai
        .request(server)
        .post('/api/posts')
        .set('authorization', 'Bearer ' + user.token)
        .send(testPost)
        .end((err, res) => {
          const body = res.body;

          // get post data
          post = body.data;

          res.should.have.status(201);
          body.should.have.all.keys(['status', 'data']);
          body.status.should.be.a('string').eql('success');
          body.data.should.include.all.keys([
            '_id',
            'title',
            'body',
            'status',
            'createdBy',
          ]);
          body.data.title.should.be.a('string').eql(testPost.title);
          body.data.body.should.be.a('string').eql(testPost.body);
          body.data.status.should.be.a('string').eql('PENDING');
          body.data.createdBy.should.be.an('string').eql(user.id);

          done();
        });
    });
    it("should admin can't create a post", (done) => {
      const testPost = {
        title: 'aaa',
        body: 'bbb',
      };
      chai
        .request(server)
        .post('/api/posts')
        .set('authorization', 'Bearer ' + admin.token)
        .send(testPost)
        .end((err, res) => {
          const body = res.body;
          res.should.have.status(403);
          body.should.include.all.keys(['status', 'message']);
          body.status.should.be.a('string').eql('fail');
          body.message.should.be
            .a('string')
            .eql('You are not allow to perform this operation');
          done();
        });
    });
  });
  describe('> Admin approve and reject a post', () => {
    it('should admin can reject a post', (done) => {
      chai
        .request(server)
        .patch('/api/posts/reject/' + post.id)
        .set('authorization', 'Bearer ' + admin.token)
        .end((err, res) => {
          const body = res.body;
          res.should.have.status(200);
          body.should.have.all.keys(['status', 'data']);
          body.status.should.be.a('string').eql('success');
          body.data.should.include.all.keys([
            '_id',
            'title',
            'body',
            'status',
            'createdBy',
          ]);
          body.data.title.should.be.a('string').eql(post.title);
          body.data.body.should.be.a('string').eql(post.body);
          body.data.status.should.be.a('string').eql('REJECTED');

          body.data.createdBy.token = user.token;
          body.data.createdBy.should.be
            .an('object')
            .that.include(user);
          done();
        });
    });
    it("should user can't reject a post", (done) => {
      chai
        .request(server)
        .patch('/api/posts/reject/' + post.id)
        .set('authorization', 'Bearer ' + user.token)
        .end((err, res) => {
          const body = res.body;
          res.should.have.status(403);
          body.should.include.all.keys(['status', 'message']);
          body.status.should.be.a('string').eql('fail');
          body.message.should.be
            .a('string')
            .eql('You are not allow to perform this operation');
          done();
        });
    });

    it('should admin can approve a post', (done) => {
      chai
        .request(server)
        .patch('/api/posts/approve/' + post.id)
        .set('authorization', 'Bearer ' + admin.token)
        .end((err, res) => {
          const body = res.body;
          res.should.have.status(200);
          body.should.have.all.keys(['status', 'data']);
          body.status.should.be.a('string').eql('success');
          body.data.should.include.all.keys([
            '_id',
            'title',
            'body',
            'status',
            'createdBy',
          ]);
          body.data.title.should.be.a('string').eql(post.title);
          body.data.body.should.be.a('string').eql(post.body);
          body.data.status.should.be.a('string').eql('APPROVED');

          body.data.createdBy.token = user.token;
          body.data.createdBy.should.be
            .an('object')
            .that.include(user);
          done();
        });
    });
    it("should normal user can't approve a post", (done) => {
      chai
        .request(server)
        .patch('/api/posts/approve/' + post.id)
        .set('authorization', 'Bearer ' + user.token)
        .end((err, res) => {
          const body = res.body;
          res.should.have.status(403);
          body.should.include.all.keys(['status', 'message']);
          body.status.should.be.a('string').eql('fail');
          body.message.should.be
            .a('string')
            .eql('You are not allow to perform this operation');
          done();
        });
    });
  });
  describe('> Get all post', () => {
    let post2;
    before(async () => {
      post2 = await Post.create({
        title: 'aaa2',
        body: 'bbb2',
        createdBy: user.id,
      });
    });
    it('should get all posts without specific query', (done) => {
      chai
        .request(server)
        .get('/api/posts/')
        .set('authorization', 'Bearer ' + admin.token)
        .end((err, res) => {
          const body = res.body;
          res.should.have.status(200);
          body.should.have.all.keys([
            'status',
            'data',
            'total',
            'page',
            'limit',
            'totalPages',
            'hasNextPage',
            'hasPrevPage',
          ]);
          body.status.should.be.a('string').eql('success');
          body.total.should.be.a('number').eql(2);
          body.page.should.be.a('number').eql(1);
          body.limit.should.be.a('number').eql(10);
          body.totalPages.should.be.a('number').eql(1);
          body.hasNextPage.should.be.a('boolean').to.be.false;
          body.hasPrevPage.should.be.a('boolean').to.be.false;
          body.data.should.be.an('array').that.have.length(2);

          body.data.forEach((post) => {
            post.should.be
              .an('object')
              .that.include.all.keys([
                '_id',
                'title',
                'body',
                'status',
                'createdBy',
              ]);
          });
          const _page1 = body.data[0];
          _page1.title.should.be.a('string').eql(post.title);
          _page1.body.should.be.a('string').eql(post.body);
          _page1.status.should.be.a('string').eql('APPROVED');

          const _page2 = body.data[1];
          _page2.title.should.be.a('string').eql(post2.title);
          _page2.body.should.be.a('string').eql(post2.body);
          _page2.status.should.be.a('string').eql('PENDING');

          done();
        });
    });
    it('should get all posts with specific query', (done) => {
      chai
        .request(server)
        .get('/api/posts?limit=1&page=2')
        .set('authorization', 'Bearer ' + admin.token)
        .end((err, res) => {
          const body = res.body;
          res.should.have.status(200);
          body.should.have.all.keys([
            'status',
            'data',
            'total',
            'page',
            'limit',
            'totalPages',
            'hasNextPage',
            'hasPrevPage',
          ]);
          body.status.should.be.a('string').eql('success');
          body.total.should.be.a('number').eql(2);
          body.page.should.be.a('number').eql(2);
          body.limit.should.be.a('number').eql(1);
          body.totalPages.should.be.a('number').eql(2);
          body.hasNextPage.should.be.a('boolean').to.be.false;
          body.hasPrevPage.should.be.a('boolean').to.be.true;
          body.data.should.be.an('array').that.have.length(1);

          const _post = body.data[0];
          _post.should.be
            .an('object')
            .that.include.all.keys([
              '_id',
              'title',
              'body',
              'status',
              'createdBy',
            ]);
          _post.title.should.be.a('string').eql(post2.title);
          _post.body.should.be.a('string').eql(post2.body);
          _post.status.should.be.a('string').eql('PENDING');
          done();
        });
    });
    it('should for user to get approved posts only', (done) => {
      chai
        .request(server)
        .get('/api/posts')
        .set('authorization', 'Bearer ' + user.token)
        .end((err, res) => {
          const body = res.body;
          res.should.have.status(200);
          body.should.have.all.keys([
            'status',
            'data',
            'total',
            'page',
            'limit',
            'totalPages',
            'hasNextPage',
            'hasPrevPage',
          ]);
          body.status.should.be.a('string').eql('success');
          body.total.should.be.a('number').eql(1);
          body.page.should.be.a('number').eql(1);
          body.limit.should.be.a('number').eql(10);
          body.totalPages.should.be.a('number').eql(1);
          body.hasNextPage.should.be.a('boolean').to.be.false;
          body.hasPrevPage.should.be.a('boolean').to.be.false;
          body.data.should.be.an('array').that.have.length(1);

          const _post = body.data[0];
          _post.should.be
            .an('object')
            .that.include.all.keys([
              '_id',
              'title',
              'body',
              'status',
              'createdBy',
            ]);
          _post.title.should.be.a('string').eql(post.title);
          _post.body.should.be.a('string').eql(post.body);
          _post.status.should.be.a('string').eql('APPROVED');
          done();
        });
    });
  });
});
