// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RecipeRegistry {
    struct Recipe {
        string title;
        string ingredients;
        string instructions;
        address author;
        string cid; // Added CID field
    }

    Recipe[] public recipes;

    event RecipeAdded(
        uint256 indexed recipeId,
        string title,
        string ingredients,
        string instructions,
        address author,
        string cid
    );

    function addRecipe(
        string memory _title,
        string memory _ingredients,
        string memory _instructions,
        string memory _cid
    ) public {
        Recipe memory newRecipe = Recipe({
            title: _title,
            ingredients: _ingredients,
            instructions: _instructions,
            author: msg.sender,
            cid: _cid
        });
        recipes.push(newRecipe);
        emit RecipeAdded(
            recipes.length - 1,
            _title,
            _ingredients,
            _instructions,
            msg.sender,
            _cid
        );
    }

    function getRecipeInfo(
        uint256 _recipeId
    )
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            address,
            string memory
        )
    {
        require(_recipeId < recipes.length, "Recipe does not exist");
        Recipe storage recipe = recipes[_recipeId];
        return (
            recipe.title,
            recipe.ingredients,
            recipe.instructions,
            recipe.author,
            recipe.cid
        );
    }
}
