const amqp = require('amqplib');
const config = require('../../utils/config');

const ProducerService = {
  /**
   * @param {string} queue The queue name.
   * @param {string} message The message to send (will be converted to buffer).
   */
  sendMessage: async (queue, message) => {
    const connection = await amqp.connect(config.rabbitMq.server);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
      durable: true,
    });

    channel.sendToQueue(queue, Buffer.from(message));

    setTimeout(() => {
      connection.close();
    }, 1000);
  },
};

module.exports = ProducerService;
