interface PostProcessWorkflowParams {
	postId: number;
}

interface Env extends Cloudflare.Env {
	POST_PROCESS_WORKFLOW: Workflow<PostProcessWorkflowParams>;
}
