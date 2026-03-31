$(() => {
    $("#addIngredient").on("click", () => {
        const ingredientName = $("#ingredientName").val();
        const ingredientAmount = $("#ingredientAmount").val();
        const ingredientType = $("#ingredientType").val();
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set(`${ingredientName}.type`, ingredientType);
        urlParams.set(`${ingredientName}.value`, ingredientAmount);
        window.location = `/?${urlParams.toString()}`;
    });
    $("#clearIngredients").on("click", () => {
        window.location = '/';
    });
    $('section').delay(500).fadeIn(500);
})

particlesJS.load('particles', '/js/particlesjs.json', () => {});