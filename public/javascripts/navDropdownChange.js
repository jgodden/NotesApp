function ChangeSelection(element) {
    subject_element = document.getElementById('subject');
    topic_element = document.getElementById('topic');
    subtopic_element = document.getElementById('subtopic');
    subject_selected_index = subject_element.selectedIndex;
    topic_selected_index = topic_element.selectedIndex;
    subtopic_selected_index = subtopic_element.selectedIndex;
    subjectid = subject_element.options[subject_selected_index].value;
    topicid = topic_element.options[topic_selected_index].value;
    subtopicid = subtopic_element.options[subtopic_selected_index].value
    if (element.name === 'subject') {
      if (subjectid == 1) {
        // <search all> selected in subject so set
        // topic and subtopic to be the same
        topicid = 1;
        subtopicid = 1;
      } else {
        topicid = 0;
        subtopicid = 0;
      }
    }
    if (element.name === 'topic') {
      if (topicid == 1) {
        // <search all> selected in topic so set
        // subtopic to be the same
        subtopicid = 1;
      } else {
        subtopicid = 0;
      }
    }
    //alert('subjectid ' + subjectid + ' topicid ' + topicid + ' subtopicid ' + subtopicid);
    window.location.href = '/repo/' + subjectid + '/' + topicid + '/' + subtopicid + '/notes';
  }