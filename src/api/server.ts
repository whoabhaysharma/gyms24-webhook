import Fastify from 'fastify';
import dotenv from 'dotenv';
import routes from './routes';

dotenv.config();

const server = Fastify({
    logger: true,
});

// Register routes
server.register(routes);

const start = async () => {
    try {
        const port = parseInt(process.env.PORT || '3000');
        await server.listen({ port, host: '0.0.0.0' });
        console.log(`Server listening on port ${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
