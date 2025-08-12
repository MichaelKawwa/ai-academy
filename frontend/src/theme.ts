import { createSystem, defaultConfig, defineConfig, defineRecipe } from "@chakra-ui/react"

const brand = {
  green: {value: "#3ad17b"},
  greenDark: {value: "#1fb868"},
  purple: {value: "#6b3cf6"},
  purpleDark: {value: "#5430c5"},
  orange: {value: "#ffa21f"},
  ink: {value: "#1f2937"},
};

const buttonRecipe = defineRecipe({
  base: {
    borderRadius: "xl",
  },
  defaultVariants: {
    colorPalette: "purple",
  },
})

const inputRecipe = defineRecipe({
  base: { borderRadius: "xl" },
})
const textareaRecipe = defineRecipe({
  base: { borderRadius: "xl" },
})
const tagRecipe = defineRecipe({
  base: { borderRadius: "xl" },
})



const config = defineConfig({
    globalCss: {
    body: {
      bg: "bg.surface",
      color: "text.default",
    }
  },
  theme: {
    tokens: {
      colors: {
        brand,
      },
      fonts: {
        heading: { value: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" },
        body: { value: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" },
      },
      
    },
    semanticTokens: {
      colors: {
        primary: {
          // Use a dark purple in light mode, but a light purple in dark mode for better contrast
          value: { base: "{colors.brand.purpleDark}", _dark: "{colors.brand.purple}" }
        },
        secondary: {
          value: { base: "{colors.brand.greenDark}", _dark: "{colors.brand.green}" }
        },
        accent: {
          value: { base: "{colors.brand.orange}", _dark: "{colors.brand.orange}" }
        },
        bg: {
          surface: { value: { base: "white", _dark: "{colors.brand.ink}" } },
          file: { value: { base: "#F6F8FF", _dark: "#0D1B2A" } },
        },
        border: {
          default: { value: { base: "#E2E8F0", _dark: "#3f4d61" } }
        },
        text: {
          default: { value: { base: "{colors.brand.ink}", _dark: "#e5e7eb" } },
          decorative: { value: { base: "{colors.brand.purpleDark}", _dark: "{colors.brand.purple}" } }
        }
      }
    },
    recipes: {
      Button: buttonRecipe,
      Tag: tagRecipe,
      Input: inputRecipe,
      Textarea: textareaRecipe,
    },
  },
})


export const system = createSystem(defaultConfig, config);