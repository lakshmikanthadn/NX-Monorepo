export default {
  if: {
    properties: {
      group: {
        const: 'apc'
      }
    }
  },
  then: {
    properties: {
      type: {
        enum: ['cats-article-type', 'article-type']
      }
    }
  }
};
