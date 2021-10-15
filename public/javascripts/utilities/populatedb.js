#! /usr/bin/env node

console.log('This script populates some test notes to your database. Specified database as argument - e.g.: populatedb mongodb+srv://Admin:M4rmoset52@cluster0.j8m3g.mongodb.net/NotesApp?retryWrites=true&w=majority');
const { DateTime } = require("luxon");

// Get arguments passed on command line
var userArgs = process.argv.slice(2);

var async = require('async')
var Note = require('../../../models/note')
var Subject = require('../../../models/subject')
var Topic = require('../../../models/topic')
var Subtopic = require('../../../models/subtopic')
var Section = require('../../../models/section')

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var notes = []
var subjectsGeo = []
var subjectsChem= []
var subjectsBio = []
var geogtopics = []
var chemtopics = []
var biotopics = []
var geog1subtopics = []
var geog2subtopics = []
var geog3subtopics = []
var chem31subtopics = []
var chem32subtopics = []
var chem33subtopics = []
var bio31subtopics = []
var bio32subtopics = []
var bio33subtopics = []
var bio34subtopics = []
var bio35subtopics = []
var bio36subtopics = []
var bio37subtopics = []
var bio38subtopics = []
var sections = []

function noteCreate(subject_id, topic_id, subtopic_id, creationDate, updateDate, title, lectureNote, keywords, questions, comments, summary, image, cb) {
  notedetail = {
    subject_id: subject_id,
    topic_id: topic_id,
    subtopic_id: subtopic_id,
    creationDate: creationDate,
    updateDate: updateDate,
    title: title,
    lectureNote: lectureNote,
    keywords: keywords,
    questions: questions,
    comments: comments,
    summary: summary,
    image: image
    }
    
  var note = new Note(notedetail);    
  note.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Note: ' + note);
    notes.push(note)
    cb(null, note)
  }  );
}

function createNotes(cb) {
    async.parallel([
        function(callback) {
          noteCreate(
            subjectsGeo[0]._id,
            subjectsGeo[0].topic[0]._id,
            subjectsGeo[0].topic[0].subtopic[0]._id,
            '2021-08-20',
            '2021-08-21',
            'Erosion in rivers',
            'Due to friction of water molecules',
            'erosion', 'how is it affected by climate?',
            '3 main drivers',
            'land formation through friction',
            '',
            callback);
        },
        function(callback) {
          noteCreate(
            subjectsBio[0]._id,
            subjectsBio[0].topic[0]._id,
            subjectsBio[0].topic[0].subtopic[0]._id,
            '2021-08-22',
            '2021-08-23',
            'Kidney function',
            'using osmosis and NaCl',
            'osmosis',
            'what is the primary cause of failure?',
            'fluid filtration',
            'fluid balance',
            '',
            callback);
        },
        function(callback) {
          noteCreate(
            subjectsChem[0]._id,
            subjectsChem[0].topic[0]._id,
            subjectsChem[0].topic[0].subtopic[0]._id,
            '2021-08-24',
            '2021-08-25',
            'Born-Haber cycle',
            "calculating lattice enthalpy knowing the change enthalpies of all other state changes. These can be found from other sources and are known for all elements",
            'enthalpy', 'are first and second orders added?',
            'uses Hess law',
            'add enthalpies to get unknown',
            '',
            callback);
        },
        function(callback) {
          noteCreate(
            subjectsGeo[0]._id,
            subjectsGeo[0].topic[0]._id,
            subjectsGeo[0].topic[0].subtopic[0]._id,
            '2021-08-26',
            '2021-08-27',
            'Climate conditions',
            'causes of climate change',
            'glaciers,warming,entropy',
            'how quickly is temp rising?',
            'global warming',
            'ozone depletion causing temp rise',
            '',
            callback);
        },
        function(callback) {
          noteCreate(
            subjectsBio[0]._id,
            subjectsBio[0].topic[0]._id,
            subjectsBio[0].topic[0].subtopic[0]._id,
            '2021-08-28',
            '2021-08-29',
            'Homeostasis',
            'controlling body conditions',
            'acidity',
            'what is the standard temperature?',
            'opposite to environmental changes',
            'keeps body functioning',
            '',
            callback);
        },
        function(callback) {
          noteCreate(
            subjectsChem[0]._id,
            subjectsChem[0].topic[0]._id,
            subjectsChem[0].topic[0].subtopic[0]._id,
            '2021-08-30',
            '2021-08-31',
            'Equilibrium constants',
            'relates to concentration and pressure',
            'dynamic equilibrium',
            'is it always a closed system?',
            'reversible reaction',
            'equal and opposite reactions',
            '',
            callback);
        },
        ],
        // optional callback
        cb);
}

function createSubjects(cb) {
  async.parallel([
      function(callback) {
        subjectGeoCreate(
          'Geography',
          geogtopics,
          callback);
      },
      function(callback) {
        subjectChemCreate(
          'Chemistry',
          chemtopics,
          callback);
      },
      function(callback) {
        subjectBioCreate(
          'Biology',
          biotopics,
          callback);
        },
        ],
        // optional callback
        cb);
}

function subjectGeoCreate(title, topics, cb) {
  subjectdetail = {
    title: title,
    topic: topics
  }
    
  var subject = new Subject(subjectdetail);    
  subject.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Subject: ' + subject);
    subjectsGeo.push(subject)
    cb(null, subject)
  }  );
}
function subjectChemCreate(title, topics, cb) {
  subjectdetail = {
    title: title,
    topic: topics
  }
    
  var subject = new Subject(subjectdetail);    
  subject.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Subject: ' + subject);
    subjectsChem.push(subject)
    cb(null, subject)
  }  );
}
function subjectBioCreate(title, topics, cb) {
  subjectdetail = {
    title: title,
    topic: topics
  }
    
  var subject = new Subject(subjectdetail);    
  subject.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Subject: ' + subject);
    subjectsBio.push(subject)
    cb(null, subject)
  }  );
}
function createGeogTopics(cb) {
  async.parallel([
      function(callback) {
        topicCreate(
          'Physical geography',
          '1',
          geogtopics,
          geog1subtopics,
          callback);
      },
      function(callback) {
        topicCreate(
          'Human geography',
          '2',
          geogtopics,
          geog2subtopics,
          callback);
      },
      function(callback) {
        topicCreate(
          'Geography fieldwork investigation',
          '3',
          geogtopics,
          geog3subtopics,
          callback);
      },
      ],
      // optional callback
      cb);
}

function createChemTopics(cb) {
  async.parallel([
      function(callback) {
        topicCreate(
          'Physical chemistry',
          '3.1',
          chemtopics,
          chem31subtopics,
          callback);
      },
      function(callback) {
        topicCreate(
          'Inorganic chemistry',
          '3.2',
          chemtopics,
          chem32subtopics,
          callback);
      },
      function(callback) {
        topicCreate(
          'Organic chemistry',
          '3.3',
          chemtopics,
          chem33subtopics,
          callback);
      },
      ],
      // optional callback
      cb);
}

function createBioTopics(cb) {
  async.parallel([
      function(callback) {
        topicCreate(
          'Biological molecules',
          '3.1',
          biotopics,
          bio31subtopics,
          callback);
      },
      function(callback) {
        topicCreate(
          'Cells',
          '3.2',
          biotopics,
          bio32subtopics,
          callback);
      },
      function(callback) {
        topicCreate(
          'Organisms exchange substances with their environment',
          '3.3',
          biotopics,
          bio33subtopics,
          callback);
      },
      function(callback) {
        topicCreate(
          'Genetic information, variation and relationships between organisms',
          '3.4',
          biotopics,
          bio34subtopics,
          callback);
      },
      function(callback) {
        topicCreate(
          'Energy transfers in and between organisms',
          '3.5',
          biotopics,
          bio35subtopics,
          callback);
      },
      function(callback) {
        topicCreate(
          'Organisms respond to changes in their internal and external environments',
          '3.6',
          biotopics,
          bio36subtopics,
          callback);
      },
      function(callback) {
        topicCreate(
          'Genetics, populations, evolution and ecosystems',
          '3.7',
          biotopics,
          bio37subtopics,
          callback);
      },
      function(callback) {
        topicCreate(
          'The control of gene expression',
          '3.8',
          biotopics,
          bio38subtopics,
          callback);
      },
      ],
      // optional callback
      cb);
}

function topicCreate(title, item, topic_list, subtopics, cb) {
  topicdetail = {
    title: title,
    item, item,
    subtopic: subtopics,
  }
    
  var topic = new Topic(topicdetail);    
  topic.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    //console.log('New Topic: ' + topic);
    topic_list.push(topic)
    cb(null, topic)
  }  );
}

function createGeog1Subtopics(cb) {
  async.parallel([
      function(callback) {
        subtopicCreate(
          'Water and carbon cycles',
          '1',
          'The major stores of water and carbon at or near the Earth’s surface and the dynamic cyclical relationships associated with them',
          geog1subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Hot desert systems and landscapes',
          '2',
          'drylands occurring at all latitudes and characterised by limited soil moisture caused by low precipitation and high evaporation',
          geog1subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Coastal systems and landscapes',
          '3',
          'dynamic environments in which landscapes develop by the interaction of winds, waves, currents and terrestrial and marine sediments',
          geog1subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Glacial systems and landscapes',
          '4',
          'dynamic environments in which landscapes continue to develop through contemporary processes but which mainly reflect former climatic conditions associated with the Pleistocene era',
          geog1subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Hazards',
          '5',
          'the lithosphere and the atmosphere, which intermittently but regularly present natural hazards to human populations',
          geog1subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Ecosystems under stress',
          '6',
          'the biosphere and in particular the nature and functioning of ecosystems and their relationships to the nature and intensity of human activities',
          geog1subtopics,
          sections,
          callback);
        },
      ],
      // optional callback
      cb);
}

function createGeog2Subtopics(cb) {
  async.parallel([
      function(callback) {
        subtopicCreate(
          'Global systems and global governance',
          '7',
          'globalisation – the economic, political and social changes associated with technological and other driving forces which have been a key feature of global economy and society in recent decades',
          geog2subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Changing places',
          '8',
          "people's engagement with places, their experience of them and the qualities they ascribe to them, all of which are of fundamental importance in their lives",
          geog2subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Contemporary urban environments',
          '9',
          'urban growth and change which are seemingly ubiquitous processes and present significant environmental and social challenges for human populations',
          geog2subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Population and the environment',
          '10',
          'the relationships between key aspects of physical geography and population numbers, population health and well-being, levels of economic development and the role and impact of the natural environment',
          geog2subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Resource security',
          '11',
          'the large-scale exploitation of unevenly distributed natural resources, which is one of the defining features of the present era',
          geog2subtopics,
          sections,
          callback);
        },
      ],
      // optional callback
      cb);
}

function createGeog3Subtopics(cb) {
  async.parallel([
      function(callback) {
        subtopicCreate(
          'Fieldwork requirements',
          '12',
          'fieldwork in relation to processes in both physical and human geography',
          geog3subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Investigation requirements',
          '13',
          'an independent investigation',
          geog3subtopics,
          sections,
          callback);
        },
      ],
      // optional callback
      cb);
}

function createChem31Subtopics(cb) {
  async.parallel([
      function(callback) {
        subtopicCreate(
          'Atomic structure',
          '3.1.1',
          'The chemical properties of elements depend on their atomic structure and in particular on the arrangement of electrons around the nucleus. The arrangement of electrons in orbitals is linked to the way in which elements are organised in the Periodic Table. Chemists can measure the mass of atoms and molecules to a high degree of accuracy in a mass spectrometer. The principles of operation of a modern mass spectrometer are studied.',
          chem31subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Amount of substance',
          '3.1.2',
          'When chemists measure out an amount of a substance, they use an amount in moles. The mole is a useful quantity because one mole of a substance always contains the same number of entities of the substance. An amount in moles can be measured out by mass in grams, by volume in dm3 of a solution of known concentration and by volume in dm3 of a gas.',
          chem31subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Bonding',
          '3.1.3',
          'The physical and chemical properties of compounds depend on the ways in which the compounds are held together by chemical bonds and by intermolecular forces. Theories of bonding explain how atoms or ions are held together in these structures. Materials scientists use knowledge of structure and bonding to engineer new materials with desirable properties. These new materials may offer new applications in a range of different modern technologies.',
          chem31subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Energetics',
          '3.1.4',
          'The enthalpy change in a chemical reaction can be measured accurately. It is important to know this value for chemical reactions that are used as a source of heat energy in applications such as domestic boilers and internal combustion engines.',
          chem31subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Kinetics',
          '3.1.5',
          'The study of kinetics enables chemists to determine how a change in conditions affects the speed of a chemical reaction. Whilst the reactivity of chemicals is a significant factor in how fast chemical reactions proceed, there are variables that can be manipulated in order to speed them up or slow them down.',
          chem31subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Chemical equilibria, Le Chatelier’s principle and Kc',
          '3.1.6',
          'In contrast with kinetics, which is a study of how quickly reactions occur, a study of equilibria indicates how far reactions will go. Le Chatelier’s principle can be used to predict the effects of changes in temperature, pressure and concentration on the yield of a reversible reaction. This has important consequences for many industrial processes. The further study of the equilibrium constant, Kc, considers how the mathematical expression for the equilibrium constant enables us to calculate how an equilibrium yield will be influenced by the concentration of reactants and products.',
          chem31subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Oxidation, reduction and redox equations',
          '3.1.7',
          'Redox reactions involve a transfer of electrons from the reducing agent to the oxidising agent. The change in the oxidation state of an element in a compound or ion is used to identify the element that has been oxidised or reduced in a given reaction. Separate half-equations are written for the oxidation or reduction processes. These half-equations can then be combined to give an overall equation for any redox reaction.',
          chem31subtopics,
          sections,
          callback);
        },
      ],
      // optional callback
      cb);
}

function createChem32Subtopics(cb) {
  async.parallel([
      function(callback) {
        subtopicCreate(
          'Periodicity',
          '3.2.1',
          'The Periodic Table provides chemists with a structured organisation of the known chemical elements from which they can make sense of their physical and chemical properties. The historical development of the Periodic Table and models of atomic structure provide good examples of how scientific ideas and explanations develop over time.',
          chem32subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Group 2, the alkaline earth metals',
          '3.2.2',
          'The elements in Group 2 are called the alkaline earth metals. The trends in the solubilities of the hydroxides and the sulfates of these elements are linked to their use. Barium sulfate, magnesium hydroxide and magnesium sulfate have applications in medicines whilst calcium hydroxide is used in agriculture to change soil pH, which is essential for good crop production and maintaining the food supply.',
          chem32subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Group 7(17), the halogens',
          '3.2.3',
          'The halogens in Group 7 are very reactive non-metals. Trends in their physical properties are examined and explained. Fluorine is too dangerous to be used in a school laboratory but the reactions of chlorine are studied. Challenges in studying the properties of elements in this group include explaining the trends in ability of the halogens to behave as oxidising agents and the halide ions to behave as reducing agents.',
          chem32subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Properties of Period 3 elements and their oxides',
          '3.2.4',
          'The reactions of the Period 3 elements with oxygen are considered. The pH of the solutions formed when the oxides react with water illustrates further trends in properties across this period. Explanations of these reactions offer opportunities to develop an in-depth understanding of how and why these reactions occur.',
          chem32subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Transition metals',
          '3.2.5',
          'The 3d block contains 10 elements, all of which are metals. Unlike the metals in Groups 1 and 2, the transition metals Ti to Cu form coloured compounds and compounds where the transition metal exists in different oxidation states. Some of these metals are familiar as catalysts. The properties of these elements are studied in this section with opportunities for a wide range of practical investigations.',
          chem32subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Reactions of ions in aqueous solution',
          '3.2.6',
          'The reactions of transition metal ions in aqueous solution provide a practical opportunity for students to show and to understand how transition metal ions can be identified by test-tube reactions in the laboratory.',
          chem32subtopics,
          sections,
          callback);
        },
      ],
      // optional callback
      cb);
}

function createChem33Subtopics(cb) {
  async.parallel([
      function(callback) {
        subtopicCreate(
          'Introduction to organic chemistry',
          '3.3.1',
          'Organic chemistry is the study of the millions of covalent compounds of the element carbon.  These structurally diverse compounds vary from naturally occurring petroleum fuels to DNA and the molecules in living systems. Organic compounds also demonstrate human ingenuity in the vast range of synthetic materials created by chemists. Many of these compounds are used as drugs, medicines and plastics.  Organic compounds are named using the International Union of Pure and Applied Chemistry (IUPAC) system and the structure or formula of molecules can be represented in various different ways. Organic mechanisms are studied, which enable reactions to be explained.  In the search for sustainable chemistry, for safer agrochemicals and for new materials to match the desire for new technology, chemistry plays the dominant role.',
          chem33subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Alkanes',
          '3.3.2',
          'Alkanes are the main constituent of crude oil, which is an important raw material for the chemical industry. Alkanes are also used as fuels and the environmental consequences of this use are considered in this section.',
          chem33subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Halogenoalkanes',
          '3.3.3',
          'Halogenoalkanes are much more reactive than alkanes. They have many uses, including as refrigerants, as solvents and in pharmaceuticals. The use of some halogenoalkanes has been restricted due to the effect of chlorofluorocarbons (CFCs) on the atmosphere.',
          chem33subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Alkenes',
          '3.3.4',
          'In alkenes, the high electron density of the carbon–carbon double bond leads to attack on these molecules by electrophiles. This section also covers the mechanism of addition to the double bond and introduces addition polymers, which are commercially important and have many uses in modern society.',
          chem33subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Alcohols',
          '3.3.5',
          'Alcohols have many scientific, medicinal and industrial uses. Ethanol is one such alcohol and it is produced using different methods, which are considered in this section. Ethanol can be used as a biofuel.',
          chem33subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Organic analysis',
          '3.3.6',
          'Our understanding of organic molecules, their structure and the way they react, has been enhanced by organic analysis. This section considers some of the analytical techniques used by chemists, including test-tube reactions and spectroscopic techniques.',
          chem33subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Optical isomerism',
          '3.3.7',
          'Compounds that contain an asymmetric carbon atom form stereoisomers that differ in their effect on plane polarised light. This type of isomerism is called optical isomerism.',
          chem33subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Aldehydes and ketones',
          '3.3.8',
          'Aldehydes, ketones, carboxylic acids and their derivatives all contain the carbonyl group which is attacked by nucleophiles. This section includes the addition reactions of aldehydes and ketones.',
          chem33subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Carboxylic acids and derivatives',
          '3.3.9',
          'Carboxylic acids are weak acids but strong enough to liberate carbon dioxide from carbonates. Esters occur naturally in vegetable oils and animal fats. Important products obtained from esters include biodiesel, soap and glycerol.',
          chem33subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Aromatic chemistry',
          '3.3.10',
          'Aromatic chemistry takes benzene as an example of this type of molecule and looks at the structure of the benzene ring and its substitution reactions.',
          chem33subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Amines',
          '3.3.11',
          'Amines are compounds based on ammonia where hydrogen atoms have been replaced by alkyl or aryl groups. This section includes their reactions as nucleophiles.',
          chem33subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Polymers',
          '3.3.12',
          'The study of polymers is extended to include condensation polymers. The ways in which condensation polymers are formed are studied, together with their properties and typical uses. Problems associated with the reuse or disposal of both addition and condensation polymers are considered.',
          chem33subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Amino acids, proteins and DNA',
          '3.3.13',
          'Amino acids, proteins and DNA are the molecules of life. In this section, the structure and bonding in these molecules and the way they interact is studied. Drug action is also considered.',
          chem33subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Organic synthesis',
          '3.3.14',
          'The formation of new organic compounds by multi-step syntheses using reactions included in the specification is covered in this section.',
          chem33subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Nuclear magnetic resonance spectroscopy',
          '3.3.15',
          'Chemists use a variety of techniques to deduce the structure of compounds. In this section, nuclear magnetic resonance spectroscopy is added to mass spectrometry and infrared spectroscopy as an analytical technique. The emphasis is on the use of analytical data to solve problems rather than on spectroscopic theory.',
          chem33subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Chromatography',
          '3.3.16',
          'Chromatography provides an important method of separating and identifying components in a mixture.  Different types of chromatography are used depending on the composition of mixture to be separated.',
          chem33subtopics,
          sections,
          callback);
        },
      ],
      // optional callback
      cb);
}

function createBio31Subtopics(cb) {
  async.parallel([
      function(callback) {
        subtopicCreate(
          'Monomers and polymers',
          '3.1.1',
          'The variety of life, both past and present, is extensive, but the biochemical basis of life is similar for all living things.  Monomers are the smaller units from which larger molecules are made.  Polymers are molecules made from a large number of monomers joined together.  Monosaccharides, amino acids and nucleotides are examples of monomers.  A condensation reaction joins two molecules together with the formation of a chemical bond and involves the elimination of a molecule of water.  A hydrolysis reaction breaks a chemical bond between two molecules and involves the use of a water molecule.',
          bio31subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Carbohydrates',
          '3.1.2',
          'Monosaccharides are the monomers from which larger carbohydrates are made. Glucose, galactose and fructose are common monosaccharides.  A condensation reaction between two monosaccharides forms a glycosidic bond.',
          bio31subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Lipids',
          '3.1.3',
          'Triglycerides and phospholipids are two groups of lipid.',
          bio31subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Proteins',
          '3.1.4',
          'Amino acids are the monomers from which proteins are made.',
          bio31subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Nucleic acids',
          '3.1.5',
          'Nucleic acids are important information-carrying molecules',
          bio31subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'ATP',
          '3.1.6',
          'A single molecule of adenosine triphosphate (ATP) is a nucleotide derivative and is formed from a molecule of ribose, a molecule of adenine and three phosphate groups.',
          bio31subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Water',
          '3.1.7',
          'Water is a major component of cells. It has several properties that are important in biology.',
          bio31subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Inorganic ions',
          '3.1.8',
          'Inorganic ions occur in solution in the cytoplasm and body fluids of organisms, some in high concentrations and others in very low concentrations.',
          bio31subtopics,
          sections,
          callback);
        },
      ],
      // optional callback
      cb);
}

function createBio32Subtopics(cb) {
  async.parallel([
      function(callback) {
        subtopicCreate(
          'Cell structure',
          '3.2.1',
          'The cell theory is a unifying concept in biology.',
          bio32subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'All cells arise from other cells',
          '3.2.2',
          'Within multicellular organisms, not all cells retain the ability to divide.',
          bio32subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Transport across cell membranes',
          '3.2.3',
          'The basic structure of all cell membranes, including cell-surface membranes and the membranes around the cell organelles of eukaryotes, is the same.',
          bio32subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Cell recognition and the immune system',
          '3.2.4',
          'Each type of cell has specific molecules on its surface that identify it. These molecules include proteins and enable the immune system to identify:',
          bio32subtopics,
          sections,
          callback);
        },
      ],
      // optional callback
      cb);
}

function createBio33Subtopics(cb) {
  async.parallel([
      function(callback) {
        subtopicCreate(
          'Surface area to volume ratio',
          '3.3.1',
          'The relationship between the size of an organism or structure and its surface area to volume ratio.',
          bio33subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Gas exchange',
          '3.3.2',
          'Adaptations of gas exchange surfaces',
          bio33subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Digestion and absorption',
          '3.3.3',
          'During digestion, large biological molecules are hydrolysed to smaller molecules that can be absorbed across cell membranes.',
          bio33subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Mass transport',
          '3.3.4',
          'Over large distances, efficient movement of substance to and from exchange surfaces is provided by mass transport.',
          bio33subtopics,
          sections,
          callback);
        },
      ],
      // optional callback
      cb);
}

function createBio34Subtopics(cb) {
  async.parallel([
      function(callback) {
        subtopicCreate(
          'DNA, genes and chromosomes',
          '3.4.1',
          'In prokaryotic cells, DNA molecules are short, circular and not associated with proteins.',
          bio34subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'DNA and protein synthesis',
          '3.4.2',
          'The concept of the genome as the complete set of genes in a cell and of the proteome as the full range of proteins that a cell is able to produce.',
          bio34subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Genetic diversity can arise as a result of mutation or during meiosis',
          '3.4.3',
          'Gene mutations involve a change in the base sequence of chromosomes. They can arise spontaneously during DNA replication and include base deletion and base substitution. Due to the degenerate nature of the genetic code, not all base substitutions cause a change in the sequence of encoded amino acids. Mutagenic agents can increase the rate of gene mutation.',
          bio34subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Genetic diversity and adaptation',
          '3.4.4',
          'Genetic diversity as the number of different alleles of genes in a population.',
          bio34subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Species and taxonomy',
          '3.4.5',
          'Two organisms belong to the same species if they are able to produce fertile offspring. Courtship behaviour as a necessary precursor to successful mating. The role of courtship in species recognition.',
          bio34subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Biodiversity within a community',
          '3.4.6',
          'Biodiversity can relate to a range of habitats, from a small local habitat to the Earth.',
          bio34subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Investigating diversity',
          '3.4.7',
          'Genetic diversity within, or between species',
          bio34subtopics,
          sections,
          callback);
        },
      ],
      // optional callback
      cb);
}

function createBio35Subtopics(cb) {
  async.parallel([
      function(callback) {
        subtopicCreate(
          'Photosynthesis',
          '3.5.1',
          'The light-dependent reaction',
          bio35subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Respiration',
          '3.5.2',
          'Respiration produces ATP.',
          bio35subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Energy and ecosystems',
          '3.5.3',
          'In any ecosystem, plants synthesise organic compounds from atmospheric, or aquatic, carbon dioxide.',
          bio35subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Nutrient cycles',
          '3.5.4',
          'Nutrients are recycled within natural ecosystems, exemplified by the nitrogen cycle and the phosphorus cycle.',
          bio35subtopics,
          sections,
          callback);
        },
      ],
      // optional callback
      cb);
}

function createBio36Subtopics(cb) {
  async.parallel([
      function(callback) {
        subtopicCreate(
          'Stimuli, both internal and external, are detected and lead to a response',
          '3.6.1',
          'Organisms increase their chance of survival by responding to changes in their environment.',
          bio36subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Nervous coordination',
          '3.6.2',
          'The structure of a myelinated motor neurone.',
          bio36subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Skeletal muscles are stimulated to contract by nerves and act as effectors',
          '3.6.3',
          'Muscles act in antagonistic pairs against an incompressible skeleton.',
          bio36subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Homeostasis is the maintenance of a stable internal environment',
          '3.6.4',
          'Homeostasis in mammals involves physiological control systems that maintain the internal environment within restricted limits.',
          bio36subtopics,
          sections,
          callback);
        },
      ],
      // optional callback
      cb);
}

function createBio37Subtopics(cb) {
  async.parallel([
      function(callback) {
        subtopicCreate(
          'Inheritance',
          '3.7.1',
          'The genotype is the genetic constitution of an organism.',
          bio37subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Populations',
          '3.7.2',
          'Species exist as one or more populations.',
          bio37subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Evolution may lead to speciation',
          '3.7.3',
          'Individuals within a population of a species may show a wide range of variation in phenotype. This is due to genetic and environmental factors. The primary source of genetic variation is mutation. Meiosis and the random fertilisation of gametes during sexual reproduction produce further genetic variation.',
          bio37subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Populations in ecosystems',
          '3.7.4',
          'Populations of different species form a community. A community and the non-living components of its environment together form an ecosystem. Ecosystems can range in size from the very small to the very large.',
          bio37subtopics,
          sections,
          callback);
        },
      ],
      // optional callback
      cb);
}

function createBio38Subtopics(cb) {
  async.parallel([
      function(callback) {
        subtopicCreate(
          'Alteration of the sequence of bases in DNA can alter the structure of proteins',
          '3.8.1',
          'Gene mutations might arise during DNA replication. They include addition, deletion, substitution, inversion, duplication and translocation of bases.',
          bio38subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Gene expression',
          '3.8.2',
          'Gene expression is controlled by a number of features',
          bio38subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Using genome projects',
          '3.8.3',
          'Sequencing projects have read the genomes of a wide range of organisms, including humans.',
          bio38subtopics,
          sections,
          callback);
        },
      function(callback) {
        subtopicCreate(
          'Gene technologies',
          '3.8.4',
          'Gene technologies allow the study and alteration of gene function allowing a better understanding of organism function and the design of new industrial and medical processes',
          bio38subtopics,
          sections,
          callback);
        },
      ],
      // optional callback
      cb);
}

function subtopicCreate(title, item, description, st_list, sections, cb) {
  subtopicdetail = {
    title: title,
    item: item,
    description: description,
    section: sections
  }

  var subtopic = new Subtopic(subtopicdetail);    
  subtopic.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    //console.log('New Subtopic: ' + subtopic);
    st_list.push(subtopic)
    cb(null, subtopic)
  }  );
}

function createSections(cb) {
  async.parallel([
      function(callback) {
        sectionCreate(
          'section title',
          'content of section',
          callback);
        },
        ],
        // optional callback
        cb);
}

function sectionCreate(title, content, cb) {
  sectiondetail = {
    title: title,
    content: content
  }
    
  var section = new Section(sectiondetail);    
  section.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Section: ' + section);
    sections.push(section)
    cb(null, section)
  }  );
}

async.series([
  createSections,

  createGeog1Subtopics,
  createGeog2Subtopics,
  createGeog3Subtopics,
  createChem31Subtopics,
  createChem32Subtopics,
  createChem33Subtopics,
  createBio31Subtopics,
  createBio32Subtopics,
  createBio33Subtopics,
  createBio34Subtopics,
  createBio35Subtopics,
  createBio36Subtopics,
  createBio37Subtopics,
  createBio38Subtopics,

  createGeogTopics,
  createChemTopics,
  createBioTopics,

  createSubjects,

  createNotes,
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+ err);
    }
    else {
        console.log('Notes: '+ notes);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});
