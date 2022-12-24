const OpenAI = require('openai-api');
const openai = new OpenAI(process.env.API_KEY);

module.exports = async (prompt) => {
    const gptResponse = await openai.complete({
        engine: 'text-davinci-003',
        prompt,
        temperature: 0.6,
        maxTokens: 500,
        topP: 0,
        presencePenalty: 0,
        frequencyPenalty: 0,
        bestOf: 1,
        n: 1,
    });

    return gptResponse.data
}