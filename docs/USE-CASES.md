- ## Suite Mode
- ### Use Case: Navigate Suite Features (UC-SUITE-01)
  - Auth: public
  - Route: `/suite`
  - Blocks/API: `suite_features_grid`, `section_cards`
  
    **Description**: Users can navigate through different sections and features provided in the suite mode.
    - Users should be able to access the suite features grid.
    - The layout and content within each section card (UI element) must be correctly displayed.
- ### Use Case: Enable/Disable Features (UC-SUITE-02)
  - Auth: pin/google
  - Route: `POST /api/suite/features/toggle`
  - Blocks/API: `SuiteFeatureToggle`
  
    **Description**: Administrators or authorized users can enable or disable specific features in the suite.
    - Users should be directed to the feature toggle endpoint via a post request method.
    - The response from the API should indicate whether the feature was successfully toggled.