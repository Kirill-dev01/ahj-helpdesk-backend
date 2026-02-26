const Koa = require('koa');
const { koaBody } = require('koa-body');
const cors = require('@koa/cors');

const app = new Koa();

// Разрешаем запросы с других портов (CORS) и учим сервер понимать JSON
app.use(cors());
app.use(koaBody({ json: true, multipart: true }));

// Наша "База данных" (пока храним в памяти сервера)
const tickets = [
    {
        id: '1',
        name: 'Починить принтер на 3 этаже',
        description: 'Жует бумагу и выдает ошибку E-42. Нужно заменить картридж.',
        status: false,
        created: Date.now()
    }
];

// Обработчик всех запросов
app.use(async (ctx) => {
    // Получаем параметры из адресной строки
    const { method, id } = ctx.request.query;

    // --- ОБРАБОТКА GET ЗАПРОСОВ ---
    if (ctx.request.method === 'GET') {
        if (method === 'allTickets') {
            // Возвращаем массив без подробного описания
            ctx.response.body = tickets.map(t => ({
                id: t.id,
                name: t.name,
                status: t.status,
                created: t.created
            }));
            return;
        }

        if (method === 'ticketById') {
            const ticket = tickets.find(t => t.id === id);
            if (ticket) {
                ctx.response.body = ticket;
            } else {
                ctx.response.status = 404;
            }
            return;
        }

        if (method === 'deleteById') {
            const index = tickets.findIndex(t => t.id === id);
            if (index !== -1) {
                tickets.splice(index, 1);
            }
            ctx.response.status = 204;
            return;
        }
    }

    // --- ОБРАБОТКА POST ЗАПРОСОВ ---
    if (ctx.request.method === 'POST') {
        if (method === 'createTicket') {
            const { name, description, status } = ctx.request.body;
            const newTicket = {
                id: Math.random().toString(36).substring(2, 9), // Генерируем случайный ID
                name: name,
                description: description || '',
                status: status || false,
                created: Date.now()
            };
            tickets.push(newTicket);
            ctx.response.body = newTicket;
            return;
        }

        if (method === 'updateById') {
            const ticket = tickets.find(t => t.id === id);
            if (ticket) {
                const { name, description, status } = ctx.request.body;
                // Обновляем только те поля, которые пришли в запросе
                if (name !== undefined) ticket.name = name;
                if (description !== undefined) ticket.description = description;
                if (status !== undefined) ticket.status = status;

                ctx.response.body = ticket;
            } else {
                ctx.response.status = 404;
            }
            return;
        }
    }

    // Если метод не найден
    ctx.response.status = 404;
});

// Запускаем сервер на порту 7070
const port = 7070;
app.listen(port, () => {
    console.log(`🚀 Сервер HelpDesk успешно запущен на http://localhost:${port}`);
});