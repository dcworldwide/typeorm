import "reflect-metadata";
import {createTestingConnections, closeTestingConnections, reloadTestingDatabases} from "../../../utils/test-utils";
import {Connection} from "../../../../src/connection/Connection";
import {Post} from "./entity/Post";
import {Category} from "./entity/Category";

describe.skip("relations > relation with primary key", () => {

    let connections: Connection[];
    before(async () => connections = await createTestingConnections({
        entities: [__dirname + "/entity/*{.js,.ts}"],
        schemaCreate: true,
        // dropSchemaOnConnection: true
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    after(() => closeTestingConnections(connections));

    describe("many-to-one with primary key in relation", function() {

        it("should work perfectly", () => Promise.all(connections.map(async connection => {

            // create first category and post and save them
            const category1 = new Category();
            category1.name = "Category saved by cascades #1";

            const post1 = new Post();
            post1.title = "Hello Post #1";
            post1.category = category1;

            await connection.entityManager.persist(post1);

            // create second category and post and save them
            const category2 = new Category();
            category2.name = "Category saved by cascades #2";

            const post2 = new Post();
            post2.title = "Hello Post #2";
            post2.category = category2;

            await connection.entityManager.persist(post2);

            // now check
            const posts = await connection.entityManager.find(Post, {
                alias: "post",
                innerJoinAndSelect: {
                    category: "post.category"
                },
                orderBy: {
                    "post.category": "ASC"
                }
            });

            posts.should.be.eql([{
                title: "Hello Post #1",
                category: {
                    id: 1,
                    name: "Category saved by cascades #1"
                }
            }, {
                title: "Hello Post #2",
                category: {
                    id: 2,
                    name: "Category saved by cascades #2"
                }
            }]);
        })));

    });

});