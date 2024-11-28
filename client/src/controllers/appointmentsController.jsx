const { Appointment } = require('../models');

const getPractitionerAppointments = async (practitionerId) => {
  return await Appointment.findAll({
    where: { practitionerId }
  });
};

module.exports = { getPractitionerAppointments };