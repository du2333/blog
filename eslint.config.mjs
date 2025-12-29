import antfu from "@antfu/eslint-config";

export default antfu({
	ignores: ["worker-configuration.d.ts", "**/routeTree.gen.ts"],
	stylistic: {
		quotes: "double",
		semi: true,
		indent: "tab",
	},
	react: true,
}, {
	rules: {
		"no-console": "warn",
		"node/prefer-global/process": "off",
	},
});
