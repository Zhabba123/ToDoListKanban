const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Чтение данных из файла
const getProjects = () => {
    const data = fs.readFileSync('projects.json');
    return JSON.parse(data);
};

// Запись данных в файл
const saveProjects = (projects) => {
    fs.writeFileSync('projects.json', JSON.stringify(projects, null, 2));
};

// Получить все проекты
app.get('/projects', (req, res) => {
    const projects = getProjects();
    res.json(projects);
});

// Добавить новую задачу
app.post('/tasks', (req, res) => {
    const { id, description, status } = req.body;
    const projects = getProjects();

    const project = projects.projects[0]; // Предположим, у нас один проект
    const column = project.content.find(c => c.status === status);
    column.tasks.push({ id, description, status });

    saveProjects(projects);
    res.json({ message: 'Task added successfully' });
});

// Обновить задачу
app.put('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const { description, status } = req.body;
    const projects = getProjects();

    const project = projects.projects[0];
    project.content.forEach(column => {
        const taskIndex = column.tasks.findIndex(task => task.id === taskId);
        if (taskIndex > -1) {
            const task = column.tasks[taskIndex];
            task.description = description;
            task.status = status;

            // Перемещение задачи в новую колонку
            if (task.status !== column.status) {
                column.tasks.splice(taskIndex, 1);
                const newColumn = project.content.find(c => c.status === status);
                newColumn.tasks.push(task);
            }
        }
    });

    saveProjects(projects);
    res.json({ message: 'Task updated successfully' });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
