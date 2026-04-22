# LogasAI Windows Worker

Этот worker нужен для Windows-машины, на которой установлен `LogasAI Analysis`.

Он:
- забирает задания матч-анализа из платформы
- скачивает исходный `MAT`
- складывает рабочую папку задания
- подготавливает `LogasAIA.INI` под конкретный `MAT` и будущий `LMA`
- при желании открывает `LogasAIA.exe`
- ждет, пока в папке появится `result.lma`
- отправляет результат обратно в платформу

## Что уже важно для автоматизации

По текущим исследованиям `LogasAI Analysis` хранит ключевые настройки здесь:

```text
%APPDATA%\LogasAIA\LogasAIA.INI
```

Для worker-а особенно полезны поля:

- `OpenImport` — путь к последнему импортируемому `MAT`
- `LastFile` — путь к последнему `LMA`
- `WindowWidth`, `WindowHeight`, `WindowLeft`, `WindowTop`, `WindowState`

Это позволяет заранее:
- подставлять нужный матч без ручного выбора “последней папки”
- фиксировать размер и положение окна под сценарий сайта
- стабилизировать окружение перед запуском GUI-автоматизации

## Что должно быть готово заранее

- платформа развернута и доступна по HTTP/HTTPS
- на сервере в `.env` задан `LOGASAI_WORKER_TOKEN`
- Prisma schema с `MatchAnalysisJob` уже применена
- на Windows установлен `LogasAI Analysis`
- на Windows установлен Node.js 22+

## Подготовить сессию отдельно

Если нужно только настроить `INI` и пути без запуска worker-а:

```powershell
npm run logasai:prepare-session -- --mat-file "C:\path\to\match.MAT.TXT" --lma-file "C:\path\to\result.LMA" --window-width 1600 --window-height 1000 --window-left 200 --window-top 100 --window-state 0
```

Если нужно сразу открыть программу:

```powershell
npm run logasai:prepare-session -- --mat-file "C:\path\to\match.MAT.TXT" --lma-file "C:\path\to\result.LMA" --window-width 1600 --window-height 1000 --launch
```

## Запуск worker-а

Из корня проекта:

```powershell
npm run worker:logasai -- --server-origin http://72.56.235.237 --worker-token YOUR_TOKEN --auto-open --window-width 1600 --window-height 1000 --window-left 200 --window-top 100
```

Можно явно указать путь к программе:

```powershell
npm run worker:logasai -- --server-origin http://72.56.235.237 --worker-token YOUR_TOKEN --logasai-path "C:\Path\To\LogasAIA.exe" --auto-open
```

Полезные параметры:

- `--server-origin` — адрес платформы
- `--worker-token` — токен worker-а, такой же, как `LOGASAI_WORKER_TOKEN` на сервере
- `--worker-id` — имя worker-а, по умолчанию hostname машины
- `--workspace-root` — папка для локальных заданий
- `--logasai-path` — путь к `LogasAIA.exe`
- `--poll-seconds` — интервал опроса, по умолчанию `15`
- `--auto-open` — автоматически запускать `LogasAIA.exe` после получения задания
- `--window-width`, `--window-height`, `--window-left`, `--window-top`, `--window-state` — фиксируют геометрию окна через `LogasAIA.INI`
- `--once` — обработать максимум одно задание и завершиться

## Как выглядит рабочий цикл

Когда worker забирает задание, он создает папку:

```text
.logasai-worker\jobs\<jobId>\
```

Внутри будут:

- `input\...mat`
- `output\result.lma` — сюда нужно сохранить итоговый файл анализа
- `README.txt`
- `result.template.json`

## Что делает оператор сейчас

Пока GUI еще не доведен до полного автоклика, сценарий такой:

1. Worker подготавливает `LogasAIA.INI`
2. Открывает `LogasAI Analysis`
3. Оператор проверяет, что открылся нужный матч
4. Запускает анализ
5. Сохраняет результат в `output\result.lma`

После появления `result.lma` worker сам отправит результат обратно в платформу.

## Куда мы движемся дальше

Следующий уровень автоматизации для `LogasAI Analysis`:

1. подготовить `INI`
2. открыть программу
3. вызвать нужные действия в GUI:
   - правый клик по плашке игроков
   - выбрать метод анализа `1` или `2`
   - нажать `Play`
4. дождаться готового `LMA`
5. вернуть его на платформу без ручного участия

То есть этот worker уже является хорошей основой для desktop bridge, даже до полной автоматизации GUI.

## Новый automation-слой

В проект добавлен Windows-скрипт:

```powershell
scripts/logasai-analysis-automation.ps1
```

Он умеет:
- запускать выбор метода через right click по плашке игроков
- нажимать кнопку `Play`
- листать ходы `вверх/вниз`
- прыгать в начало и конец матча

Примеры:

```powershell
npm run logasai:automate -- -Action start-analysis -Method 1
```

```powershell
npm run logasai:automate -- -Action start-analysis -Method 2
```

```powershell
npm run logasai:automate -- -Action next-move
```

```powershell
npm run logasai:automate -- -Action previous-move
```

```powershell
npm run logasai:automate -- -Action first-move
```

```powershell
npm run logasai:automate -- -Action last-move
```

Параметры `BannerX`, `BannerY`, `PlayX`, `PlayY` задаются как нормализованные координаты внутри клиентской области окна. Это сделано специально, чтобы можно было тонко подстроить автоматизацию под конкретный layout, не переписывая код.
