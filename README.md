# Тестовое задание для отбора в проект "Прямой контакт"
Angular приложение, которое позволяет выводить прогноз погоды за 5 дней для города с использованием [API](https://openweathermap.org/forecast5)

<br><br>

## Техническое задание
#### Требования:
* Вёрстка максимально простая, БЕЗ использования библиотек
* Нужно построить приложение используя стратегию `onPush, RxJS` и сервисы, БЕЗ использования стейтов `ngrx, ngxs, etc`. Можно использовать signals
* UI содержит поле-автокомплит Поиска по городам и Таблицу с прогнозом по выбранному городу
* В поле-автокомплит вводим поисковую строку, ниже выскакивает выпадающее меню со списком подходящих городов из запроса (лимит 10 штук) `http://api.openweathermap.org/geo/1.0/direct?q={city name}&limit=10&appid={API key}` с возможностью выбора одного города
* Когда город выбран, нужно взять его координаты, вызвать `https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}&cnt=1` и затем вывеcти прогноз по этому городу в Таблице
* Когда ничего не нашлось или возникла ошибка, нужно обязательно на это отреагировать
* URL браузера (роут + параметры) должен обновляться исходя из параметров поиска и  сохраняться после перезагрузки страницы
* Для форматирования значений в шаблоне желательно использовать `pipes`
* SOLID, DRY не просто слова для тебя, следует спроектировать так, чтобы было легко поддерживать и расширять в дальнейшем
* `any` не должно быть
<br><br>

## Реализация
Проект сгенерирован при помощи [Angular CLI](https://github.com/angular/angular-cli) версии 17.3.11.
<br>
`ng serve` режим разработки. Доступна по адресу `http://localhost:4200/`
<br>
`ng build` Сборка проекта. Доступна по адресу `dist/`
<br>
`ng help` Больше информации по использованию Angular CLI. Также доступно по ссылке [Angular CLI Overview and Command Reference](https://angular.io/cli).
<br>